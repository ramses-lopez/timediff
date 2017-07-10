var rootModule = angular.module('userDashboardModule', [])

rootModule.controller('userDashboardController', ['$rootScope'
	,'$state'
	,'$log'
	,'$scope'
	,'competitionService'
	,'disciplineService'
	,'envService'
	,'$http'
	,'$translate'
	,'$stateParams'
	,'connectionService'
	,'competitionTypeService'
	,'coreService'
	,'$timeout'
	,function(
		$rootScope
		,$state
		,$log
		,$scope
		,competitionService
		,disciplineService
		,envService
		,$http
		,$translate
		,$stateParams
		,connectionService
		,competitionTypeService
		,coreService
		,$timeout
	) {

	if(!$rootScope.currentUser) $state.go('root')

	// disciplineService.getDisciplines()
	// .then(function(result){
	// 	$scope.disciplines = result
	// })

	disciplineService.getSubdisciplines()
	.then(function(result){
		$scope.subdisciplines =
		result.map(function(sd){
			sd.discipline_name = sd.discipline.name
			return sd
		})
	})

	competitionTypeService.getCompetitionTypes()
	.then(function(result){
		$scope.competitionTypes = result.data.data
	})

	//carga las competiciones mas recientes, para mostrar en el landing page
	competitionService.getCompetitions({ sort: '-updated_at' })
	.then(function(results){
		$scope.myCompetitions = results.data.data
	})
	.catch(function(error){
		console.error(error)
		$rootScope.displayMessage(error, 'danger')
	})

	connectionService.get(`user/${$rootScope.currentUser.id}/feed`)
	.then(function(results){
		$scope.userFeed = results.data.data
	})
	.catch(function(error){
		console.error(error)
	})

	//Competition
	$scope.competition = {}
	$scope.newCompetition = function(){
		$scope.competition = {
			created_by_id: $rootScope.currentUser.id
		}
	}

	$scope.updateCompetition = function(competition){
		// console.log(competition);
		$scope.competition = competition
	}

	var saveCompetition = null

	$scope.saveCompetition = function(competition){

		var subdiscipline = $scope.subdisciplines.filter(function(sd){
			return competition.subdiscipline_id == sd.id
		})[0]

		competition.discipline_id = subdiscipline.discipline.id

		competitionService.saveCompetition(competition)
		.then(function(result){
			$('#competitionModal').modal('hide')
			savedCompetition = result
			$rootScope.displayMessage('Competition created', 'success')
			return $rootScope.refreshCurrentUser()
		})
		.then(function(result){
			// Hay problemas con el modal, la operacion hide es async
			// https://github.com/twbs/bootstrap/issues/3902
			$timeout(function(){
				$state.go(`umbrella`, {competitionId: savedCompetition.id})
			}, 500);
		})
		.catch(function(error){
			$rootScope.displayMessage(error, 'danger')
		})
	}
}])
