var myApp = angular.module('myApp', ['ngRoute']);

var baseurl = 'http://localhost:8080/';



myApp.config(function ($routeProvider){

    $routeProvider

    .when(null,{
        templateUrl:'screen/home.html',
        controller: 'mainController'
    })

    .when('/register',{
        templateUrl:'screen/register.html',
        controller: 'getInController'
    })


    .when('/bidding',{
        templateUrl:'screen/bidding.html',
        controller: 'biddingController'
    })


    .when('/login',{
        templateUrl:'screen/login.html',
        controller: 'loginController'
    })

    .when('/waiting',{
        templateUrl:'screen/waiting.html',
        controller: 'waitngController'
    })

    .when('/Error',{
        templateUrl:'screen/error.html',
        controller: 'errorController'
    })

    .when('/simulate',{
        templateUrl:'screen/simulate.html',
        controller: 'simulateController'
    })

})


myApp.controller('mainController', ['$scope', '$http', function($scope,$http) {
    $scope.isCreate = false;
    $scope.isEdit = false;
    $scope.isView = false;


    $scope.getOption = function(option){
        
        if(option===1) {
            $scope.isCreate = true;
            $scope.isEdit = false;
            $scope.isView = false;
        }
        else if(option===2) {
            $scope.isCreate = false;
            $scope.isEdit = true;
            $scope.isView = false;
        }
        else {
            $scope.isCreate = false;
            $scope.isEdit = false;
            $scope.isView = true;
            $http.get('http://localhost:8080/api/getUsers').then(function (response){
                $scope.getData = JSON.parse(JSON.stringify(response.data));
            });
        }

      }

}]);


myApp.controller('loginController', ['$scope', '$http', function($scope,$http) {
   
    
    $scope.submit = function(){
       var req = $scope.formAdata;
        $http({
            method: 'POST',
            url: baseurl+'loginUser',
            data: $scope.formAdata
          }).success(function (data) {
               if(data.payload!=null){
            const  user = data.payload;
              window.sessionStorage.setItem("user", JSON.stringify(user));
            
               if(user.id!=null && user.id!=""){
                 window.location.href="#/bidding";
              }

            }

            else{
               window.alert("invalid credentials");
            }
        });
          
        }
        
}]);



myApp.controller('biddingController', ['$scope', '$http', function($scope,$http) {

    $scope.playerData={}
    $scope.playerData.finalval=0;
    $scope.playerData.gf='';
    $scope.playerDataList={};

    $scope.simulate={};

    var pos = "jh";
    $scope.team="";

    $scope.chat_flag=false;

 

    
        
   var user = JSON.parse(window.sessionStorage.getItem("user"));
   var team = {id:""};

   $http({

    method: 'POST',
    url: baseurl+'getUserDetails',
    data:  {user_id:user.id}

   }).success(function (data) {
         window.sessionStorage.setItem("team", JSON.stringify(data.payload.team));
         console.log("---"+data.payload.team);
          team = JSON.parse(data.payload.team);
          $scope.team = JSON.parse(data.payload.team)
      }).error(function (data) {
         alert('System Error. Contact Admin.');
          window.location.href = "#/Waiting";
      });
   
      
   var batchInfo;
    var req = {"user_id": user.id}

    $http({
        method: 'POST',
        url: baseurl+'getSchedule',
        data:  JSON.stringify(req)
        
      }).success(function (data) {
          batchInfo = data.payload;
          window.sessionStorage.setItem("batch", JSON.stringify(data.payload));
          
      }).error(function (data) {
         alert('System Error. Contact Admin.');
          window.location.href = "#/Error";
      });

      
      batchInfo = JSON.parse(window.sessionStorage.getItem("batch"));
      

      function player() {
          
      
    if(batchInfo.gf!==null && batchInfo.gf!==undefined && batchInfo.gf==="T") {
      
    
       req = {"time" : batchInfo.gf, "user_id=" : user.id}

      var player = null;

      $http({
        method: 'POST',
        url: baseurl+'getPlayers',
        data:  JSON.stringify(req)
        
      }).success(function (data) {
          window.sessionStorage.setItem("player", JSON.stringify(data.payload));
          player = data.payload;
          $scope.playerData = data.payload;
          
  
          $scope.playerData.role ="foo"
                pos  = $scope.playerData.position;
                if(pos.indexOf('A') > -1){
                
                $scope.playerData.role = "All Rounder";

                }
                else if(pos.indexOf('S') > -1){
                   
                $scope.playerData.role = "Batsman";
                }
                else if(pos.indexOf('B') > -1){
                    
                $scope.playerData.role = "Bowler";
                }
                 if(pos.indexOf("W") > -1){
                     console.log();
                   if($scope.playerData.role === undefined || $scope.playerData.role === null || $scope.playerData.role.length === 0)
                $scope.playerData.role = "Wicket Keeper";

                else  $scope.playerData.role = $scope.playerData.role+" & Wicket Keeper";

                $scope.$apply();

                }

               

                if($scope.playerData.capFlg=="T")
                $scope.playerData.role = $scope.playerData.role + "  (CAPTAIN)" 
            


                

      }).error(function (data) {
         alert('System Error. Contact Admin.');
          window.location.href = "#/Error";
      });                 
           
          
}

        else if(batchInfo.gf!==null && batchInfo.gf!==undefined && batchInfo.gf==="S"){
            window.location.href="#/simulate";
        }

        else{
            window.location.href="#/waiting";
        }

        teamRefresh();
        

}


setInterval(function(){

            player();
            
        }, 10000)


        

        $scope.bidOnPlayer  = function(){
            req = {"playerId" : $scope.playerData.playerId, "teamid":team.id};

        console.log("------- " +req);
        $http({
            method: 'POST',
            url: baseurl+'bidOnPlayer',
            data: JSON.stringify(req)
          }).success(function (data) {
              console.log("Success");
              refreshPlayer();
          }).error(function (data) {
             alert('System Error. Contact Admin.');
              window.location.href = "#/Error";
          });
        }
 

        function refreshPlayer() {
            $http({

                method: 'POST',
                url: baseurl+'getUserDetails',
                data:  {user_id:user.id}
            
               }).success(function (data) {
                     window.sessionStorage.setItem("team", JSON.stringify(data.payload.team));
                      $scope.team = JSON.parse(data.payload.team);
                      $scope.$apply();
                  }).error(function (data) {
                     alert('');
                      window.location.href = "#/bidding";
                  });
        }


        function teamRefresh() {
            $http({

                method: 'POST',
                url: baseurl+'simulateByUser',
                data:  {user_id:user.id, team_id:team.id}
            
               }).success(function (data) {
                     $scope.simulate = data.payload;
                      $scope.$apply();
                  }).error(function (data) {
                     alert('');
                      window.location.href = "#/bidding";
                  });
        }

        $scope.$apply();



   
}]);


myApp.controller('waitingController', ['$scope', '$http', function($scope,$http) {

   
}]);



myApp.controller('simulateController', ['$scope', '$http', function($scope,$http) {

    var user = JSON.parse(window.sessionStorage.getItem("user"));
    var team = JSON.parse(window.sessionStorage.getItem("team"));

    $scope.simulate="";

    $http({

        method: 'POST',
        url: baseurl+'simulate',
        data:  {user_id:user.id, team_id:team.id}
    
       }).success(function (data) {
             $scope.simulate = data.payload;
              $scope.$apply();
          }).error(function (data) {
             alert('');
              window.location.href = "#/bidding";
          });
   
}]);