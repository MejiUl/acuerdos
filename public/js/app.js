angular.module("acuerdosApp", ['ngRoute', 'ui.bootstrap', 'ngFileUpload', 'pdf'])
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
            .when("/acuerdos/nuevo", {
                templateUrl: "altaAcuerdo.html",
                controller: "altaAcuerdoController"
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
    .controller("altaAcuerdoController", function($scope, ServiceAcuerdos, $filter, $window, Upload) {
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
            fecha_creacion: new Date(),
            attachmentURL: ""
        }

        // File upload
        $scope.attachment;

        // Add more textBox to the Acuerdos JSON
        $scope.addMore = function() {
            $scope.acuerdo.terminos.push({
                textBox: ""
            });
        }

        $scope.saveAcuerdov1 = function() {
            $scope.acuerdo.slug = $scope.acuerdo.expediente + '-' + $filter('date')($scope.acuerdo.publ_boletin, 'ddMMyyyy');
            Upload.upload({
                url: "/apiv1/acuerdos",
                data: {
                    file: $scope.attachment,
                    otherData: angular.copy($scope.acuerdo)
                }
            }).then(function(resp) {
                if (resp.status === 201) {
                    console.log("Succesfull POST operation: " + resp);
                    $window.location.href = '/#/acuerdos'
                } else {
                    console.log(resp);
                }
            }, function(resp) {
                console.log("2. " + resp)
            })
        }
    });
