sap.ui.define([
    "novamart/inventory/inventoryportal/controller/BaseController",
    "novamart/inventory/inventoryportal/model/formatter",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, formatter, Fragment, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("novamart.inventory.inventoryportal.controller.Detail", {

        formatter: formatter,

        onInit: function () {
            var oRouter = this.getRouter();
            oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sProductId = oEvent.getParameter("arguments").productId;
            var oModel = this.getOwnerComponent().getModel("products");

            var fnBind = function () {
                if (!oModel) {
                    return;
                }

                var aProducts = oModel.getProperty("/products") || [];
                var iIndex = aProducts.findIndex(function (p) {
                    return String(p.productId || p.ProductId || p.id) === String(sProductId);
                });

                var oUIModel = this.getOwnerComponent().getModel("ui");

                if (iIndex !== -1) {
                    if (oUIModel) {
                        oUIModel.setProperty("/layout", "TwoColumnsMidExpanded");
                    }
                    this.getView().bindElement({
                        path: "/products/" + iIndex,
                        model: "products"
                    });
                } else {
                    // Unbind previous context to clear Detail.view
                    this.getView().unbindElement("products");
                    this.getView().unbindElement();

                    if (oUIModel) {
                        oUIModel.setProperty("/layout", "TwoColumnsMidExpanded");
                    }

                    // Display NotFound target in midColumnPages
                    this.getRouter().getTargets().display("notFound");
                }
            }.bind(this);

            if (oModel && oModel.getProperty("/products")) {
                fnBind();
            } else if (oModel) {
                oModel.attachRequestCompleted(fnBind, this);
            }
        },
        // Handler mapped to XML: press=".onEditPress"
        onEditPress: function () {
            var oView = this.getView();
            var oContext = oView.getBindingContext() || oView.getBindingContext("products");

            if (!oContext) {
                return;
            }

            var oCurrentData = Object.assign({}, oContext.getObject());

            if (!this._oEditDialogModel) {
                var JSONModel = sap.ui.require("sap/ui/model/json/JSONModel");
                this._oEditDialogModel = new JSONModel();
            }

            this._oEditDialogModel.setData({
                title: "Edit Product: " + (oCurrentData.Name || oCurrentData.name),
                isEdit: true,
                product: oCurrentData
            });

            if (!this._pEditDialog) {
                this._pEditDialog = Fragment.load({
                    id: oView.getId(),
                    name: "novamart.inventory.inventoryportal.fragment.AddEditProduct",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pEditDialog.then(function (oDialog) {
                oDialog.setModel(this._oEditDialogModel, "dialog");
                oDialog.open();
            }.bind(this));
        },

        // Handler for Reorder Stock Button
        onReorderPress: function () {
            // Get the explicit 'products' model binding context
            var oContext = this.getView().getBindingContext("products") || this.getView().getBindingContext();
            if (!oContext) {
                MessageToast.show("No item context found.");
                return;
            }

            var oProductsModel = oContext.getModel();
            var sPath = oContext.getPath();

            // Fetch product properties matching your JSON keys (lowercase)
            var sProductName = oContext.getProperty("name") || "Product";
            var iCurrentStock = parseInt(oContext.getProperty("stock"), 10) || 0;

            // Simulate stock reorder by adding 10 units
            var iReorderAmount = 10;
            var iNewStock = iCurrentStock + iReorderAmount;

            // 1. Update the stock property in the model
            oProductsModel.setProperty(sPath + "/stock", iNewStock);

            // 2. Update the lastUpdated property to current date
            var sToday = new Date().toISOString().split("T")[0];
            oProductsModel.setProperty(sPath + "/lastUpdated", sToday);

            // 3. Provide immediate visual feedback to the user
            MessageToast.show("Reorder placed! Added " + iReorderAmount + " units to " + sProductName + ". New Stock: " + iNewStock);
        },

        // Handler for Delete Product Button
        onDeletePress: function () {
            var oContext = this.getView().getBindingContext() || this.getView().getBindingContext("products");
            if (!oContext) {
                return;
            }

            var sProductName = oContext.getProperty("Name") || "Product";
            var sPath = oContext.getPath();
            var iIndex = parseInt(sPath.split("/").pop(), 10);

            MessageBox.confirm("Are you sure you want to delete " + sProductName + "?", {
                title: "Delete Product",
                actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.DELETE,
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.DELETE) {
                        var oModel = this.getModel("products") || this.getOwnerComponent().getModel();
                        var aProducts = oModel.getProperty("/products");
                        
                        aProducts.splice(iIndex, 1);
                        oModel.setProperty("/products", aProducts);

                        MessageToast.show(sProductName + " deleted successfully.");
                        this.onCloseDetailPress();
                    }
                }.bind(this)
            });
        },

        onInputChange: function (oEvent) {
            var oInput = oEvent.getSource();
            if (oInput.getValue().trim()) {
                oInput.setValueState("None");
            }
        },

        _validateForm: function () {
            var bValid = true;
            var sErrorMsg = "";

            var oInpName = this.byId("inpEditName");
            var oInpCategory = this.byId("inpEditCategory");
            var oInpSKU = this.byId("inpEditSKU");
            var oInpPrice = this.byId("inpEditPrice");
            var oInpStock = this.byId("inpEditStock");

            if (oInpName && (!oInpName.getValue() || !oInpName.getValue().trim())) {
                oInpName.setValueState("Error");
                oInpName.setValueStateText("Product Name is required.");
                if (!sErrorMsg) sErrorMsg = "Product Name is required.";
                bValid = false;
            } else if (oInpName) {
                oInpName.setValueState("None");
            }

            if (oInpCategory && (!oInpCategory.getValue() || !oInpCategory.getValue().trim())) {
                oInpCategory.setValueState("Error");
                oInpCategory.setValueStateText("Category is required.");
                if (!sErrorMsg) sErrorMsg = "Category is required.";
                bValid = false;
            } else if (oInpCategory) {
                oInpCategory.setValueState("None");
            }

            if (oInpSKU && (!oInpSKU.getValue() || !oInpSKU.getValue().trim())) {
                oInpSKU.setValueState("Error");
                oInpSKU.setValueStateText("SKU is required.");
                if (!sErrorMsg) sErrorMsg = "SKU is required.";
                bValid = false;
            } else if (oInpSKU) {
                oInpSKU.setValueState("None");
            }

            if (oInpPrice) {
                var fPrice = parseFloat(oInpPrice.getValue());
                if (isNaN(fPrice) || fPrice < 0) {
                    oInpPrice.setValueState("Error");
                    oInpPrice.setValueStateText("Price cannot be negative or empty.");
                    if (!sErrorMsg) sErrorMsg = "Price must be a valid number >= 0.";
                    bValid = false;
                } else {
                    oInpPrice.setValueState("None");
                }
            }

            if (oInpStock) {
                var iStock = parseInt(oInpStock.getValue(), 10);
                if (isNaN(iStock) || iStock < 0) {
                    oInpStock.setValueState("Error");
                    oInpStock.setValueStateText("Stock quantity cannot be negative or empty.");
                    if (!sErrorMsg) sErrorMsg = "Stock Quantity must be a valid number >= 0.";
                    bValid = false;
                } else {
                    oInpStock.setValueState("None");
                }
            }

            this._sValidationError = sErrorMsg;
            return bValid;
        },

        onSaveProductDialog: function () {
            if (!this._validateForm()) {
                MessageToast.show(this._sValidationError);
                return;
            }

            var oUpdatedProduct = this._oEditDialogModel.getProperty("/product");
            oUpdatedProduct.Price = parseFloat(oUpdatedProduct.Price || oUpdatedProduct.price);
            oUpdatedProduct.StockQuantity = parseInt(oUpdatedProduct.StockQuantity || oUpdatedProduct.stock, 10);
            oUpdatedProduct.ReorderThreshold = parseInt(oUpdatedProduct.ReorderThreshold || oUpdatedProduct.reorderThreshold, 10) || 0;
            oUpdatedProduct.LastUpdated = new Date().toISOString().split("T")[0];

            var oContext = this.getView().getBindingContext() || this.getView().getBindingContext("products");
            var oProductsModel = this.getModel("products") || this.getOwnerComponent().getModel();

            oProductsModel.setProperty(oContext.getPath(), oUpdatedProduct);

            MessageToast.show("Product updated successfully!");

            this._pEditDialog.then(function (oDialog) {
                oDialog.close();
            });
        },

        onCancelProductDialog: function () {
            MessageBox.confirm("Are you sure you want to cancel? Unsaved changes will be lost.", {
                title: "Cancel Edit",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        this._resetValidationStates();
                        this._pEditDialog.then(function (oDialog) {
                            oDialog.close();
                        });
                    }
                }.bind(this)
            });
        },

        _resetValidationStates: function () {
            var aInputIds = ["inpEditName", "inpEditCategory", "inpEditSKU", "inpEditPrice", "inpEditStock"];
            aInputIds.forEach(function (sId) {
                var oControl = this.byId(sId);
                if (oControl) {
                    oControl.setValueState("None");
                }
            }.bind(this));
        },

        onCloseDetailPress: function () {
            // Close mid column and go back to master
            var oUIModel = this.getOwnerComponent().getModel("ui");
            if (oUIModel) {
                oUIModel.setProperty("/layout", "OneColumn");
            }
            this.getRouter().navTo("master", {}, true);
        }

    });
});