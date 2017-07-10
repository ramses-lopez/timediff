var standingsModule = angular.module('standingsModule', [])

standingsModule.controller('standingsController', ['$rootScope',
	'$state',
	'$log',
	'$scope',
	'connectionService',
	'envService',
	'$http',
	'$translate',
	'$stateParams',
	'categoryService',
	'groupService',
	'standings',
	'currentCategory',
	function($rootScope
		,$state
		,$log
		,$scope
		,connectionService
		,envService
		,$http
		,$translate
		,$stateParams
		,categoryService
		,groupService
		,standings
		,currentCategory) {

		var init = function(){
			if(standings) {
				$scope.standings = standings
			}

			if(currentCategory) {
				// currentCategory is a resolved value. See state 'umbrella.standings' declaration on app.js
				$scope.currentCategory = currentCategory.data.data
				//TODO: this is awfully ugly
				$scope.currentCategory = categoryService.getGroupsbyCategory($scope.currentCategory)
			}
		}

		$scope.filterStandingTable = function(e){
			return e.standing_table && e.standing_table.length > 0
		}

		init();
}])
