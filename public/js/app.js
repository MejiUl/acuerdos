angular.module("acuerdosApp", ['ngRoute', 'ui.bootstrap'])
    .config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "acuerdos.html",
                controller: "homeController"
            })
            .when("/acuerdos", {
                templateUrl: "acuerdos.html",
                controller: "acuerdosController",
                resolve: {
                  acuerdos: function(ServiceAcuerdos){
                    return ServiceAcuerdos.getAcuerdos();
                  }
                }

            })
            .when("/acuerdos/nuevo", {
                templateUrl: "altaAcuerdo.html",
                controller: "altaAcuerdoController",

            })
            .otherwise({
                redirectTo: "/"
            })
    })
    .service("ServiceAcuerdos", function($http) {
        this.getAcuerdos = function() {
            return $http.get("/acuerdos").
                then(function(response) {
                    return response;
                }, function(err) {
                    alert("No se encontró el elemento:" + err);
                });
        }
    })
    .controller("homeController", function($scope) {
        $scope.cat = "Holi hooe";
    })
    .controller("acuerdosController", function(acuerdos, $scope){
        $scope.acuerdos = acuerdos.data;
      })

      .controller("altaAcuerdoController", function($scope){
        $scope.tipos_not = ["Listado", "Presencial"];
        $scope.tipo_not = "";

        $scope.popup2 = {
          opened: false
        };

        $scope.open2 = function() {
          $scope.popup2.opened = true;
        };

        // Calendar Options
        $scope.dateOptions = {
        dateDisabled: disabled,
        formatYear: 'yy',
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(),
        startingDay: 1
        };

        function disabled(data) {
          var date = data.date,
          mode = data.mode;
          return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
        }
      });
