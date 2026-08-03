sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "novamart/inventory/inventoryportal/model/models"
], function (UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("novamart.inventory.inventoryportal.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {
            // Call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // Set device model
            this.setModel(models.createDeviceModel(), "device");

            // Initialize router
            if (this.getRouter()) {
                this.getRouter().initialize();
            }
        }
    });
});