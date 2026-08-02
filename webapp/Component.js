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
            // Call the base UIComponent's init method FIRST
            UIComponent.prototype.init.apply(this, arguments);

            // Set the device model
            this.setModel(models.createDeviceModel(), "device");

            // Safe check to initialize router
            if (this.getRouter()) {
                this.getRouter().initialize();
            }
        }
    });
});