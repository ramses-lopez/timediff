var rootModule = angular.module('rootModule', [])

rootModule.controller('rootController', ['$rootScope'
	,'$state'
	,'$log'
	,'$scope'
	,'competitionService'
	,'envService'
	,'$http'
	,'$translate'
	,'$stateParams'
	,function(
		$rootScope
		, $state
		, $log
		, $scope
		, competitionService
		, envService
		, $http
		, $translate
		, $stateParams) {

}])
