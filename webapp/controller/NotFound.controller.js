sap.ui.define([
    "novamart/inventory/inventoryportal/controller/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("novamart.inventory.inventoryportal.controller.NotFound", {
        
        onNavBack: function () {
            var oUIModel = this.getOwnerComponent().getModel("ui");
            if (oUIModel) {
                oUIModel.setProperty("/layout", "OneColumn");
            }
            var oApp = this.getOwnerComponent().getRootControl().byId("app");
            var oFCL = this.getOwnerComponent().getRootControl().byId("fcl");
            if (oApp && oFCL) {
                oApp.to(oFCL);
            }
            this.getRouter().navTo("master", {}, true);
        }
    });
});