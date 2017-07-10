var teamModule = angular.module('teamModule', [])

teamModule.controller('teamController', [
		'$rootScope',
		'$state',
		'$log',
		'$scope',
		'connectionService',
		'envService',
		'$http',
		'$translate',
		'$stateParams',
		'categoryService',
		'teamService',
		'team',
		'currentCategory',
		'lodash',
	function(
		$rootScope,
		$state,
		$log,
		$scope,
		connectionService,
		envService,
		$http,
		$translate,
		$stateParams,
		categoryService,
		teamService,
		team,
		currentCategory,
		_) {

		var loadCategory = function()
		{
			//TODO: this is awfully ugly
			$scope.currentCategory = categoryService.getGroupsbyCategory($scope.currentCategory)

			categoryService.getTeamsByCategory($scope.currentCategory.id)
			.then(function(result){
				//Lista de equipos q pertenecen a la competition
				$scope.teamList =
					_.chain(result)
					.groupBy('team.name')
					.pairs()
					.value()
			})

			categoryService.getCategoryPhaseTeam($scope.currentCategory).then(function(result){
				$scope.phaseTeamList = result
			})
		}

		var init = function(){
			$scope.toggleVerticalList = false
			$scope.currentPlayer = {}
			$scope.playerEvents = {}

			if($stateParams.teamId && $stateParams.categoryId){
				categoryService.getSummonedPlayerList($stateParams.categoryId, $stateParams.teamId)
				.then(function(summonedPlayers) {

					// TODO: Filtrar los players_team que sean de este equipo
					$scope.summonedPlayers = summonedPlayers.data.data
				})
			}

			if(team) $scope.team = team.data.data

			if(currentCategory) {
				// currentCategory is a resolved value. See state 'umbrella.teams' declaration on app.js
				$scope.currentCategory = currentCategory.data.data
				loadCategory()
			}

			//TODO: revisar si en esta consulta se esta filtrando correctamente la categoría
			if(currentCategory && team) {
				teamService.getMatchesByCategory(team.data.data.id, currentCategory.data.data.id)
				.then(function(r){
					$scope.teamMatchesList = r.data.data
				})
			}
		}

		init();

		$scope.toggleView = function(){
			$scope.toggleVerticalList = !$scope.toggleVerticalList
		}

		$scope.setTeamToGroup = function(team, group) {
			//Set team to the group
			console.log('Set teamToGroup')
			console.log('team', team)
			console.log('group', group)
			var data = {}
			data.category_id = $scope.currentCategory.id
			data.team_id = team.id
			data.phase_id = $scope.phaseInit.id
			data.active = !team.assigned
			data.id = team.teamPlayingCategoryId
			$scope.saveTeamToGroup(data)
		}

		$scope.saveTeamToGroup = function(data)
		{
			console.log('Category_team_player ', data)

			//UPDATE TEAMS ON CATEGORY
			console.log("data.id ",data.id)
			if(data.id > 0)
			{
				categoryService.updateTeamToCategoryInvite(data)
				.then(function(result){
					// console.log(result)
					$rootScope.displayMsg(`Team playing list updated`, 0)
					team.active = team.assigned = data.active

					//Reload Category
					loadCategory()
				})
				.catch(function(error){
					$log.error(error)
					$rootScope.displayMsg(error)
				})
			}
			else
			{
				categoryService.createTeamToCategoryInvite(data)
				.then(function(result){
					console.log('result:' , result)
					$rootScope.displayMsg(`Team playing list updated`, 0)
					team.active = team.assigned = data.active
					team.teamPlayingCategoryId = result.data.data.id

					//Reload Category
					loadCategory()
				})
				.catch(function(error){
					$log.error(error)
					$rootScope.displayMsg(error)
				})
			}
		}
}])
