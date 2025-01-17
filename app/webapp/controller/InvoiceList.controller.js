sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";
	return Controller.extend("sap.ui.demo.walkthrough.controller.InvoiceList", {
		formatter: formatter, 
		onInit : function () {
			var oViewModel = new JSONModel({
				currency: "EUR"
			});
			this.getView().setModel(oViewModel, "view");
		},
		onFilterInvoices : function (oEvent) {

			// build filter array
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("ProductName", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.byId("invoiceList");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
		},
        onPress: function (oEvent) {
			var oItem = oEvent.getSource();
			var oBindingContext = oItem.getBindingContext("invoice");
			
			if (oBindingContext) {
				
				var sPath = oBindingContext.getPath().substr(1);  // e.g., "Invoices/1"
				var sEncodedPath = encodeURIComponent(sPath); // e.g., "Invoices%2F1"
				
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("detail", {
					invoicePath: sEncodedPath
				});
			} else {
				console.error("Binding context is null.");
			}
		}
	});
});