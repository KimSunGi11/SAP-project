sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("sap.ui.demo.walkthrough.controller.CreatePlayer", {
        onInit: function () {
            // 'newPlayer' 모델 생성 및 초기화
            var oModel = new sap.ui.model.json.JSONModel({
                PlayerName: "",
                Age: "",
                Position: "",
                Team: "",
                Country: ""
            });
            this.getView().setModel(oModel, "newPlayer");
        },

        onSaveNewPlayer: function () {
            var oData = this.getView().getModel("newPlayer").getData();
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
                var aPlayers = data.value; // OData V4의 경우, 결과는 value 속성에 포함됨
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
                MessageToast.show("새로운 선수가 추가되었습니다.");
                // OData 모델 새로 고침
                this.getView().getModel("footballPlayers").refresh(); // 모델 새로 고침
                // 이전 페이지로 돌아가기
                window.history.go(-1);
            })
            .catch(error => {
                console.error("선수 추가에 실패했습니다:", error);
                MessageToast.show("선수 추가에 실패했습니다.");
            });
        },

        onNavBack: function () {
            window.history.go(-1);
        }
    });
});