var aboutModule = angular.module('aboutModule', [])

aboutModule.controller('aboutController', ['$rootScope','$state','$log', '$scope', 'connectionService', 'competitionService', 'envService', '$http', '$translate', '$stateParams',
	function($rootScope, $state,$log, $scope, connectionService, competitionService, envService, $http, $translate, $stateParams)

{
	//==========================================================================
	// Basic params for this controller
	//==========================================================================

	$scope.competitionId = $state.params.competitionId
	$scope.seasonId = $state.params.seasonId
	$scope.categoryId = $state.params.categoryId

	//==========================================================================
	// Internal functions
	//==========================================================================

	var getCompetitionByID = function(id) {
		competitionService.getCompetition(id).then(function(results) {
			if(results.data.code != "0" || !results.data.data) {
				$state.go('root')
			}
			else {
				$scope.competition = results.data.data
				$rootScope.backgroundImage = $scope.competition.portraitUrl || '/img/field-background.jpg'

				//$scope.competition.seasons.map(getCategoriesBySeason)
			}
		}).catch(function(error){
			console.log(error);

			$translate('COMPETITION.NOT_FOUND').then(function (errorMsg) {
				$rootScope.displayMessage(errorMsg, 'danger')
			});

			$state.go('root')
		})
	}

	//==========================================================================
	// Portal Initialization
	//==========================================================================
	getCompetitionByID($scope.competitionId)

}]);