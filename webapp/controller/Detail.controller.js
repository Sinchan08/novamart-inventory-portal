sap.ui.define([
    "novamart/inventory/inventoryportal/controller/BaseController",
    "novamart/inventory/inventoryportal/model/formatter",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function (BaseController, formatter, Fragment, MessageToast, JSONModel, MessageBox) {
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

            if (!oModel) {
                return;
            }

            var fnEvaluateAndBind = function () {
                var aProducts = oModel.getProperty("/products");

                if (!aProducts || !Array.isArray(aProducts) || aProducts.length === 0) {
                    return;
                }

                var iIndex = aProducts.findIndex(function (p) {
                    return String(p.productId || p.ProductId || p.id) === String(sProductId);
                });

                if (iIndex !== -1) {
                    var oUIModel = this.getOwnerComponent().getModel("ui");
                    if (oUIModel) {
                        oUIModel.setProperty("/layout", "TwoColumnsMidExpanded");
                    }
                    this.getView().bindElement({
                        path: "/products/" + iIndex,
                        model: "products"
                    });
                } else {
                    this.getView().unbindElement("products");
                    this.getView().unbindElement();
                    this.getRouter().navTo("notFound", {}, true);
                }
            }.bind(this);

            var aProducts = oModel.getProperty("/products");
            if (aProducts && Array.isArray(aProducts) && aProducts.length > 0) {
                fnEvaluateAndBind();
            } else {
                oModel.attachRequestCompleted(function fnHandler() {
                    oModel.detachRequestCompleted(fnHandler, this);
                    fnEvaluateAndBind();
                }, this);
            }
        },

        onEditPress: function () {
            var oView = this.getView();
            var oContext = oView.getBindingContext("products") || oView.getBindingContext();

            if (!oContext) {
                return;
            }

            var oCurrentData = Object.assign({}, oContext.getObject());

            if (!this._oEditDialogModel) {
                this._oEditDialogModel = new JSONModel();
            }

            this._oEditDialogModel.setData({
                title: "Edit Product: " + (oCurrentData.name || oCurrentData.Name || "Product"),
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

        onReorderPress: function () {
            var oContext = this.getView().getBindingContext("products") || this.getView().getBindingContext();
            if (!oContext) {
                MessageToast.show("No item context found.");
                return;
            }

            var oProductsModel = oContext.getModel();
            var sPath = oContext.getPath();

            var sProductName = oContext.getProperty("name") || "Product";
            var iCurrentStock = parseInt(oContext.getProperty("stock"), 10) || 0;

            var iReorderAmount = 10;
            var iNewStock = iCurrentStock + iReorderAmount;

            oProductsModel.setProperty(sPath + "/stock", iNewStock);

            var sToday = new Date().toISOString().split("T")[0];
            oProductsModel.setProperty(sPath + "/lastUpdated", sToday);

            MessageToast.show("Reorder placed! Added " + iReorderAmount + " units to " + sProductName + ". New Stock: " + iNewStock);
        },

        onDeletePress: function () {
            var oContext = this.getView().getBindingContext("products") || this.getView().getBindingContext();
            if (!oContext) {
                return;
            }

            var sProductName = oContext.getProperty("name") || "Product";
            var sPath = oContext.getPath();
            var iIndex = parseInt(sPath.split("/").pop(), 10);

            MessageBox.confirm("Are you sure you want to delete " + sProductName + "?", {
                title: "Delete Product",
                actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.DELETE,
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.DELETE) {
                        var oModel = this.getView().getModel("products") || this.getOwnerComponent().getModel("products");
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
            oUpdatedProduct.price = parseFloat(oUpdatedProduct.price || oUpdatedProduct.Price);
            oUpdatedProduct.stock = parseInt(oUpdatedProduct.stock || oUpdatedProduct.StockQuantity, 10);
            oUpdatedProduct.reorderThreshold = parseInt(oUpdatedProduct.reorderThreshold || oUpdatedProduct.ReorderThreshold, 10) || 0;
            oUpdatedProduct.lastUpdated = new Date().toISOString().split("T")[0];

            var oContext = this.getView().getBindingContext("products") || this.getView().getBindingContext();
            var oProductsModel = this.getView().getModel("products") || this.getOwnerComponent().getModel("products");

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
                        if (typeof this._resetValidationStates === "function") {
                            this._resetValidationStates();
                        }

                        if (this._pEditDialog) {
                            this._pEditDialog.then(function (oDialog) {
                                if (oDialog && oDialog.isOpen()) {
                                    oDialog.close();
                                }
                            });
                        }
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
            var oUIModel = this.getOwnerComponent().getModel("ui");
            if (oUIModel) {
                oUIModel.setProperty("/layout", "OneColumn");
            }
            this.getRouter().navTo("master", {}, true);
        }

    });
});