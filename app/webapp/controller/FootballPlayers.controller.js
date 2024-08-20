sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function (Controller, MessageBox, Filter, FilterOperator, Sorter) {
    "use strict";

    return Controller.extend("sap.ui.demo.walkthrough.controller.FootballPlayers", {
        onFilterPlayers: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            var oList = this.byId("footballPlayersTable");
            var oBinding = oList.getBinding("items");
        
            // OData 모델의 필터링을 사용
            var aFilters = [];
            if (sQuery) {
                aFilters.push(new Filter("PlayerName", FilterOperator.Contains, sQuery));
            }
            oBinding.filter(aFilters);
        },

        onCreatePlayer: function() {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("createPlayer");
        },
        
        onCloseCreateDialog: function() {
            this._oCreateDialog.close();
        },
        
        onSaveNewPlayer: function() {
            var oData = this._oCreateDialog.getModel("newPlayer").getData();
            var sServiceUrl = this.getView().getModel("footballPlayers").sServiceUrl;
        
            // 데이터 형식 변환
            oData.Age = parseInt(oData.Age, 10); // Age를 숫자로 변환
        
            // 기존 선수 데이터 읽기
            fetch(sServiceUrl + "FootballPlayers", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok. Status: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                // 기존 선수들에서 최대 PlayerID 찾기
                var aPlayers = data.value; 
                var iMaxID = aPlayers.reduce(function(iMax, oPlayer) {
                    return Math.max(iMax, oPlayer.PlayerID);
                }, 0);
        
                // 새로운 PlayerID 설정
                oData.PlayerID = iMaxID + 1;
        
                console.log("전송할 데이터:", JSON.stringify(oData)); // 데이터 로깅
        
                // 선수 추가 요청
                return fetch(sServiceUrl + "FootballPlayers", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(oData)
                });
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Network response was not ok. Status: ' + response.status);
                }
            })
            .then(data => {
                sap.m.MessageToast.show("새로운 선수가 추가되었습니다.");
                this._oCreateDialog.close();
                // OData 모델 새로 고침
                this.getView().getModel("footballPlayers").refresh(); // 모델 새로 고침
            })
            .catch(error => {
                console.error("선수 추가에 실패했습니다:", error);
                sap.m.MessageToast.show("선수 추가에 실패했습니다.");
            });
        },

        onPress: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("footballPlayers").getObject();
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("footballPlayersDetail", {
                playerId: oItem.PlayerID
            });
        },

        onEditPlayer: function(oEvent) {
            var oItem = oEvent.getSource().getParent().getBindingContext("footballPlayers").getObject();
            this._openEditDialog(oItem);
        },

        _openEditDialog: function(oPlayer) {
            if (!this._oEditDialog) {
                this._oEditDialog = sap.ui.xmlfragment("sap.ui.demo.walkthrough.view.EditPlayerDialog", this);
                this.getView().addDependent(this._oEditDialog);
            }

            var oModel = new sap.ui.model.json.JSONModel(oPlayer);
            this._oEditDialog.setModel(oModel, "editPlayer");

            this._oEditDialog.open();
        },

        onSaveEditedPlayer: function() {
            var oData = this._oEditDialog.getModel("editPlayer").getData();
            console.log("수정할 데이터:", oData); // oData 출력
        
            var sServiceUrl = this.getView().getModel("footballPlayers").sServiceUrl;
        
            // 데이터 형식 변환
            oData.Age = parseInt(oData.Age, 10); // Age를 숫자로 변환
        
            var sRequestUrl = sServiceUrl + "FootballPlayers(" + oData.PlayerID + ")"; 
            console.log("요청 URL:", sRequestUrl); // 요청 URL 출력
        
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
                // OData 모델 새로 고침
                this.getView().getModel("footballPlayers").refresh(); // 모델 새로 고침
            })
            .catch(error => {
                console.error("선수 수정에 실패했습니다:", error);
                sap.m.MessageToast.show("선수 수정에 실패했습니다.");
            });
        },
        
        onCloseEditDialog: function() {
            if (this._oEditDialog) {
                this._oEditDialog.close();
            }
        },

        onDeletePlayer: function(oEvent) {
            var oItem = oEvent.getSource().getParent().getBindingContext("footballPlayers").getObject();
            var playerId = oItem.PlayerID;
        
            // 삭제 확인 메시지 박스
            MessageBox.confirm("정말로 이 선수를 삭제하시겠습니까?", {
                title: "삭제 확인",
                onClose: (oAction) => {
                    if (oAction === MessageBox.Action.OK) {
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
                                // OData 모델 새로 고침
                                this.getView().getModel("footballPlayers").refresh(); 
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
        },

        onOpenSortDialog: function() {
            if (!this._oSortDialog) {
                this._oSortDialog = sap.ui.xmlfragment("sap.ui.demo.walkthrough.view.SortDialog", this);
                this.getView().addDependent(this._oSortDialog);
            }
            this._oSortDialog.open();
        },

        onCloseSortDialog: function() {
            if (this._oSortDialog) {
                this._oSortDialog.close();
            }
        },

        onSortOptionSelected: function(oEvent) {
            var selectedOption = oEvent.getSource().getText();
            this._sortOption = this._mapSortOption(selectedOption);
        },

        onSortOrderSelected: function(oEvent) {
            var selectedOrder = oEvent.getSource().getText();
            this._sortOrder = selectedOrder === "오름차순" ? "asc" : "desc";
        },

        onApplySort: function() {
            var oList = this.byId("footballPlayersTable");
            var oBinding = oList.getBinding("items");
            var aSorters = [];

            if (this._sortOption) {
                aSorters.push(new Sorter(this._sortOption, this._sortOrder === "desc"));
            }

            oBinding.sort(aSorters);
            this._oSortDialog.close();
        },

        _mapSortOption: function(selectedOption) {
            // 선택된 정렬 옵션을 OData 속성 이름으로 매핑
            switch (selectedOption) {
                case "나이":
                    return "Age";
                case "포지션":
                    return "Position";
                case "팀":
                    return "Team";
                default:
                    return "";
            }
        }
    });
});
