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
                    acuerdos: function(ServiceAcuerdos) {
                        return ServiceAcuerdos.getAcuerdos();
                    }
                }

            })
            .when("/acuerdos/:id", {
                templateUrl: "editAcuerdo.html",
                controller: "editAcuerdoController",
                resolve: {
                    acuerdo: function($route, ServiceAcuerdos) { // use $route instead $routeProvider
                        return ServiceAcuerdos.getAcuerdo($route.current.params.id);
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
        // GET ALL acuerdos
        this.getAcuerdos = function() {
                return $http.get("/apiv1/acuerdos").
                then(function(response) {
                    return response;
                }, function(err) {
                    alert("No se encontró el elemento:" + err);
                });
            }
            // GET a single acuerdo
        this.getAcuerdo = function(id) {
                return $http.get("/apiv1/acuerdos/" + id).
                then(function(response) {
                    return response;
                }, function(err) {
                    alert("No se encontró el elemento: " + id);
                })
            }
            // POST Acuerdo
        this.createAcuerdo = function(jsonData) {
            console.log("Inside Service" + jsonData)
            return $http.post('/apiv1/acuerdos', jsonData).
            then(function(response) {
                return response;
            }, function(err) {
                alert("No se pudo realizar la petición POST" + err)
            })
        }
    })
    .controller("homeController", function($scope) {
        $scope.cat = "Holi hooe";
    })
    .controller("acuerdosController", function(acuerdos, $scope) {
        $scope.acuerdos = acuerdos.data;
    })
    .controller("editAcuerdoController", function($scope, $routeParams, acuerdo) {
        $scope.acuerdo = acuerdo.data;
    })

.controller("altaAcuerdoController", function($scope, ServiceAcuerdos, uibDateParser, $filter, $window) {
    $scope.tipos_not = ["Listado", "Presencial"];

    // JSON document
    $scope.acuerdo = {
        slug: "",
        actor: "",
        demandado: "",
        juzgado: "",
        expediente: "",
        juicio: "",
        publ_boletin: "",
        tipo_not: "",
        surte_efectos: "",
        terminos: [],
        creado_por: 'francisco@abogados.com',
        fecha_creacion: new Date()
    }

    // Add more textBox to the Acuerdos JSON
    $scope.addMore = function() {
        $scope.acuerdo.terminos.push({
            textBox: ""
        });
    }

    $scope.popup1 = {
        opened: false
    }

    $scope.popup1 = function() {
        $scope.popup1.opened = true;
    }

    $scope.popup2 = {
        opened: false
    };

    $scope.open1 = function() {
        $scope.popup1.opened = true;
    }

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

    // POST Function to create an Acuerdo
    $scope.saveAcuerdo = function() {
        $scope.acuerdo.slug = $scope.acuerdo.expediente + '-' + $filter('date')($scope.acuerdo.publ_boletin, 'ddMMyyyy');
        ServiceAcuerdos.createAcuerdo($scope.acuerdo)
            .then(function(doc) {
                console.log("Succesfull POST operation: " + doc);
                $window.location.href = '/#/acuerdos'
            }, function(response) {
                alert(response);
            })
    }
});
