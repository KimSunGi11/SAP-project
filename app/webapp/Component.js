sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/ODataModel", // ODataModel 추가
	"./controller/HelloDialog"
], function (UIComponent, JSONModel, ODataModel, HelloDialog) {
	"use strict";
	return UIComponent.extend("sap.ui.demo.walkthrough.Component", {
		metadata : {
			manifest : "json"
		},
		init : function () {
			UIComponent.prototype.init.apply(this, arguments);

			// 기본 데이터 모델 설정
			var oData = {
				recipient : {
					name : "World"
				}
			};
			var oModel = new JSONModel(oData);
			this.setModel(oModel);

			// 인보이스 모델 설정
			var oInvoiceModel = new JSONModel();
			oInvoiceModel.loadData(jQuery.sap.getModulePath("sap.ui.demo.walkthrough", "/Invoices.json"));
			this.setModel(oInvoiceModel, "invoice");

			// OData 모델 설정
			var sServiceUrl = "/odata/v4/request/"; // OData 서비스 엔드포인트
			var oODataModel = new ODataModel({
				serviceUrl: sServiceUrl,
				synchronizationMode: "None",
				operationMode: "Server" // 서버 모드로 설정
			});
			this.setModel(oODataModel, "footballPlayers"); // 모델 이름 설정

			this._helloDialog = new HelloDialog(this.getRootControl());
			this.getRouter().initialize();
		},

		exit : function () {
			this._helloDialog.destroy();
			delete this._helloDialog;
		},

		openHelloDialog : function () {
			this._helloDialog.open();
		}
	});
});