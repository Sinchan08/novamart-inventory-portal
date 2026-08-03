sap.ui.define([
    "novamart/inventory/inventoryportal/controller/BaseController",
    "novamart/inventory/inventoryportal/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, formatter, Filter, FilterOperator, Sorter, JSONModel, Fragment, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("novamart.inventory.inventoryportal.controller.List", {

        formatter: formatter,

        onInit: function () {
            var oView = this.getView();
        var oModel = this.getOwnerComponent().getModel("products");

        if (oModel) {
            var aProducts = oModel.getProperty("/products");
            if (!aProducts || aProducts.length === 0) {
                oView.setBusy(true);

                oModel.attachEventOnce("requestCompleted", function () {
                    oView.setBusy(false);
                });
                oModel.attachEventOnce("requestFailed", function () {
                    oView.setBusy(false);
                });
            }
        }
            this._setupCategories();
        },
        _setupCategories: function () {
            var oModel = this.getOwnerComponent().getModel("products");
            if (!oModel) {
                return;
            }

            var fnExtract = function () {
                var aProducts = oModel.getProperty("/products") || [];
                var aCategories = [];

                aProducts.forEach(function (oProd) {
                    if (oProd.category && !aCategories.some(function (c) { return c.key === oProd.category; })) {
                        aCategories.push({
                            key: oProd.category,
                            text: oProd.category
                        });
                    }
                });

                oModel.setProperty("/categories", aCategories);
            };

            var aProducts = oModel.getProperty("/products");
            if (aProducts && aProducts.length > 0) {
                fnExtract();
            } else {
                oModel.attachRequestCompleted(function fnHandler() {
                    oModel.detachRequestCompleted(fnHandler, this);
                    fnExtract();
                }, this);
            }
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue") || oEvent.getParameter("query");
            var aFilters = [];

            if (sQuery && sQuery.length > 0) {
                var oFilterName = new Filter("name", FilterOperator.Contains, sQuery);
                var oFilterCategory = new Filter("category", FilterOperator.Contains, sQuery);
                aFilters.push(new Filter({
                    filters: [oFilterName, oFilterCategory],
                    and: false
                }));
            }

            var oList = this.byId("productList");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters);
        },

        onProductPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext("products");

            if (!oContext) {
                return;
            }

            var sProductId = oContext.getProperty("productId");
            var oUIModel = this.getOwnerComponent().getModel("ui");
            if (oUIModel) {
                oUIModel.setProperty("/layout", "TwoColumnsMidExpanded");
            }

            this.getRouter().navTo("detail", {
                productId: sProductId
            });
        },

        onProductSelect: function (oEvent) {
            var oListItem = oEvent.getParameter("listItem");
            if (oListItem) {
                this.onProductPress({ getSource: function () { return oListItem; } });
            }
        },

        onAddProduct: function () {
            var oView = this.getView();

            this._resetValidationStates();

            if (!this._oAddDialogModel) {
                this._oAddDialogModel = new JSONModel({
                    title: "Add New Product",
                    isEdit: false,
                    product: {
                        productId: "P-" + Math.floor(1000 + Math.random() * 9000),
                        name: "",
                        category: "",
                        sku: "",
                        price: 0,
                        currency: "USD",
                        stock: 0,
                        reorderThreshold: 10,
                        supplier: "",
                        warehouse: "",
                        description: "",
                        lastUpdated: new Date().toISOString().split("T")[0]
                    }
                });
            } else {
                this._oAddDialogModel.setData({
                    title: "Add New Product",
                    isEdit: false,
                    product: {
                        productId: "P-" + Math.floor(1000 + Math.random() * 9000),
                        name: "",
                        category: "",
                        sku: "",
                        price: 0,
                        currency: "USD",
                        stock: 0,
                        reorderThreshold: 10,
                        supplier: "",
                        warehouse: "",
                        description: "",
                        lastUpdated: new Date().toISOString().split("T")[0]
                    }
                });
            }

            if (!this._pAddDialog) {
                this._pAddDialog = Fragment.load({
                    id: oView.getId(),
                    name: "novamart.inventory.inventoryportal.fragment.AddEditProduct",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pAddDialog.then(function (oDialog) {
                oDialog.setModel(this._oAddDialogModel, "dialog");
                oDialog.open();
            }.bind(this));
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

        _resetValidationStates: function () {
            var aInputIds = ["inpEditName", "inpEditCategory", "inpEditSKU", "inpEditPrice", "inpEditStock"];
            aInputIds.forEach(function (sId) {
                var oControl = this.byId(sId);
                if (oControl) {
                    oControl.setValueState("None");
                }
            }.bind(this));
        },

        onSaveProductDialog: function () {
            if (!this._validateForm()) {
                MessageToast.show(this._sValidationError);
                return;
            }

            var oData = this._oAddDialogModel.getProperty("/product");
            oData.price = parseFloat(oData.price);
            oData.stock = parseInt(oData.stock, 10);
            oData.reorderThreshold = parseInt(oData.reorderThreshold, 10) || 0;

            var oProductsModel = this.getModel("products");
            var aProducts = oProductsModel.getProperty("/products") || [];
            
            aProducts.unshift(oData);
            oProductsModel.setProperty("/products", aProducts);

            MessageToast.show("New product added successfully!");
            
            this._resetValidationStates();
            this._pAddDialog.then(function (oDialog) {
                oDialog.close();
            });
        },

        onCancelProductDialog: function () {
            MessageBox.confirm("Are you sure you want to cancel? Unsaved changes will be lost.", {
                title: "Cancel Action",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        this._resetValidationStates();
                        this._pAddDialog.then(function (oDialog) {
                            oDialog.close();
                        });
                    }
                }.bind(this)
            });
        },

        onOpenViewSettings: function () {
            var oView = this.getView();

            if (!this._pViewSettingsDialog) {
                this._pViewSettingsDialog = Fragment.load({
                    id: oView.getId(),
                    name: "novamart.inventory.inventoryportal.fragment.ViewSettings",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pViewSettingsDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onConfirmViewSettings: function (oEvent) {
            var oTable = this.byId("productList");
            var oBinding = oTable.getBinding("items");
            var mParams = oEvent.getParameters();
            var aSorters = [];
            if (mParams.groupItem) {
                aSorters.push(new Sorter(mParams.groupItem.getKey(), mParams.groupDescending, true));
            }
            if (mParams.sortItem) {
                aSorters.push(new Sorter(mParams.sortItem.getKey(), mParams.sortDescending));
            }
            oBinding.sort(aSorters);
            var aCategoryFilters = [];
            var aStockFilters = [];

            if (mParams.filterItems && mParams.filterItems.length > 0) {
                mParams.filterItems.forEach(function (oItem) {
                    var sKey = oItem.getKey();
                    var sParentKey = oItem.getParent().getKey();

                    if (sParentKey === "category") {
                        aCategoryFilters.push(new Filter("category", FilterOperator.EQ, sKey));
                    } else if (sParentKey === "stock") {
                        if (sKey === "In Stock") {
                            aStockFilters.push(new Filter("stock", FilterOperator.GE, 10));
                        } else if (sKey === "Low Stock") {
                            aStockFilters.push(new Filter("stock", FilterOperator.BT, 1, 9));
                        } else if (sKey === "OutOfStock" || sKey === "Out of Stock") {
                            aStockFilters.push(new Filter("stock", FilterOperator.EQ, 0));
                        }
                    }
                });
            }
            var aFinalFilters = [];

            if (aCategoryFilters.length > 0) {
                aFinalFilters.push(new Filter({ filters: aCategoryFilters, and: false }));
            }
            if (aStockFilters.length > 0) {
                aFinalFilters.push(new Filter({ filters: aStockFilters, and: false }));
            }

            oBinding.filter(aFinalFilters);
        },
        onListUpdateFinished: function (oEvent) {
            var iTotalItems = oEvent.getParameter("total");
            var oTitle = this.byId("txtListTitle");

            if (oTitle) {
                oTitle.setText("Products (" + iTotalItems + ")");
            }
        }

    });
});