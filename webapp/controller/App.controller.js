sap.ui.define([
    "novamart/inventory/inventoryportal/controller/BaseController",
    "sap/f/library"
], function (BaseController, fioriLibrary) {
    "use strict";

    return BaseController.extend("novamart.inventory.inventoryportal.controller.App", {
        
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.attachRouteMatched(this.onRouteMatched, this);
        },

        onRouteMatched: function (oEvent) {
            var sRouteName = oEvent.getParameter("name");
            var oFCL = this.byId("fcl");

            if (!oFCL) {
                return;
            }

            if (sRouteName === "detail") {
                oFCL.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);
            } else if (sRouteName === "master") {
                oFCL.setLayout(fioriLibrary.LayoutType.OneColumn);
            }
        }
    });
});