sap.ui.define([
    "sap/ui/core/library"
], function (coreLibrary) {
    "use strict";

    var ValueState = coreLibrary.ValueState;

    return {
        formatStockStatusState: function (iStock) {
            if (iStock === undefined || iStock === null) {
                return ValueState.None;
            }

            iStock = parseInt(iStock, 10);

            if (isNaN(iStock)) {
                return ValueState.None;
            }

            if (iStock === 0) {
                return ValueState.Error;    // Red
            } else if (iStock <= 10) {
                return ValueState.Warning;  // Orange
            } else {
                return ValueState.Success;  // Green
            }
        },

        formatStockStatusText: function (iStock) {
            if (iStock === undefined || iStock === null) {
                return "N/A";
            }

            iStock = parseInt(iStock, 10);

            if (isNaN(iStock)) {
                return "Unknown";
            }

            if (iStock === 0) {
                return "Out of Stock";
            } else if (iStock <= 10) {
                return "Low Stock (" + iStock + " left)";
            } else {
                return "In Stock";
            }
        },

        formatCurrency: function (fPrice) {
            if (!fPrice || isNaN(fPrice)) {
                return "0.00";
            }
            return parseFloat(fPrice).toFixed(2);
        },

        formatPrice: function (fPrice, sCurrency) {
            if (!fPrice || isNaN(fPrice)) {
                return "$0.00";
            }
            sCurrency = sCurrency || "USD";
            return parseFloat(fPrice).toFixed(2) + " " + sCurrency;
        },

        formatDate: function (sDate) {
            if (!sDate) {
                return "";
            }
            var oDate = new Date(sDate);
            if (isNaN(oDate.getTime())) {
                return sDate;
            }
            return oDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
            });
        }
    };
});