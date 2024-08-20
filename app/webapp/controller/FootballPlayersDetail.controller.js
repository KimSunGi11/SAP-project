sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast"
], function (Controller, History, MessageToast) {
    "use strict";

    return Controller.extend("sap.ui.demo.walkthrough.controller.FootballPlayersDetail", {
        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("footballPlayersDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sPlayerId = oEvent.getParameter("arguments").playerId;
            this.getView().bindElement({
                path: "/FootballPlayers(" + sPlayerId + ")",
                model: "footballPlayers"
            });
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("footballPlayers", {}, true);
            }
        },

        onRatingChange: function (oEvent) {
            var fValue = oEvent.getParameter("value");
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            MessageToast.show(oResourceBundle.getText("ratingConfirmation", [fValue]));
        },

        // U
        onEditPlayer: function (oEvent) {
            var oItem = oEvent.getSource().getParent().getBindingContext("footballPlayers").getObject();
            this._openEditDialog(oItem);
        },

        _openEditDialog: function (oPlayer) {
            if (!this._oEditDialog) {
                this._oEditDialog = sap.ui.xmlfragment("sap.ui.demo.walkthrough.view.EditPlayerDialog", this);
                this.getView().addDependent(this._oEditDialog);
            }

            // 'editPlayer' 모델 생성 및 초기화
            var oModel = new sap.ui.model.json.JSONModel(oPlayer);
            this._oEditDialog.setModel(oModel, "editPlayer");

            this._oEditDialog.open();
        },

        onSaveEditedPlayer: function () {
            var oData = this._oEditDialog.getModel("editPlayer").getData();
            console.log("수정할 데이터:", oData); 

            var sServiceUrl = this.getView().getModel("footballPlayers").sServiceUrl;

            // 데이터 형식 변환
            oData.Age = parseInt(oData.Age, 10); // Age를 숫자로 변환

            var sRequestUrl = sServiceUrl + "FootballPlayers(" + oData.PlayerID + ")"; // PlayerID로 수정
            console.log("요청 URL:", sRequestUrl); 

            fetch(sRequestUrl, {
                method: 'PUT', // 수정 요청
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(oData)
            })
                .then(response => {
                    console.log("응답 상태:", response.status); 
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Network response was not ok. Status: ' + response.status);
                    }
                })
                .then(data => {
                    sap.m.MessageToast.show("선수가 수정되었습니다.");
                    this._oEditDialog.close();
                    
                    this.getView().getModel("footballPlayers").refresh(); // 모델 새로 고침
                })
                .catch(error => {
                    console.error("선수 수정에 실패했습니다:", error);
                    sap.m.MessageToast.show("선수 수정에 실패했습니다.");
                });
        },

        onCloseEditDialog: function () {
            if (this._oEditDialog) {
                this._oEditDialog.close();
            }
        },

        // D
        onDeletePlayer: function(oEvent) {
            var oItem = oEvent.getSource().getParent().getBindingContext("footballPlayers").getObject();
            var playerId = oItem.PlayerID;
        
            // 삭제 확인 메시지 박스
            sap.m.MessageBox.confirm("정말로 이 선수를 삭제하시겠습니까?", {
                title: "삭제 확인",
                onClose: (oAction) => {
                    if (oAction === sap.m.MessageBox.Action.OK) {
                        // 삭제 요청
                        var sServiceUrl = this.getView().getModel("footballPlayers").sServiceUrl;
                        var sRequestUrl = sServiceUrl + "FootballPlayers(" + playerId + ")";
        
                        fetch(sRequestUrl, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                        .then(response => {
                            if (response.ok) {
                                sap.m.MessageToast.show("선수가 삭제되었습니다.");
                                // URL로 리다이렉트
                                window.location.href = "https://port4004-workspaces-ws-756wl.us10.trial.applicationstudio.cloud.sap/webapp/index.html";
                            } else {
                                throw new Error('Network response was not ok. Status: ' + response.status);
                            }
                        })
                        .catch(error => {
                            console.error("선수 삭제에 실패했습니다:", error);
                            sap.m.MessageToast.show("선수 삭제에 실패했습니다.");
                        });
                    }
                }
            });
        }
    });
});