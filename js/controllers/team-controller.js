var teamModule = angular.module('teamModule', [])

teamModule.controller('teamController', [
		'$rootScope',
		'$state',
		'$scope',
		'envService',
		'$translate',
		'$stateParams',
		'categoryService',
		'teamService',
		'team',
		'currentCategory',
		'coreService',
	function(
		$rootScope,
		$state,
		$scope,
		envService,
		$translate,
		$stateParams,
		categoryService,
		teamService,
		team,
		currentCategory,
		coreService
		){

		$scope.availableTeams = []

		$scope.teamSelected = null

		//header con sorting para listado de equipos en una categoria
		$scope.teamListHeader = [ {name: 'Team'}
			,{name: 'Payment'}
			,{name: 'Roster'}
			,{name: 'Documents'}
			,{name: 'Players'}
			,{name: 'Status'}
			,{name: 'Group'}
			,{name: 'Position in group'}]

		var loadCategory = function(){
			$scope.currentCategory = categoryService.getGroupsbyCategory($scope.currentCategory)
			//se toma la fase inicial para setear nuevos equipos
			$scope.initialPhase = $scope.currentCategory.phases.sort(function(a, b){
				if(a.position == b.position) return 0
				else return (a.position > b.position) ? 1 : -1
			})[0]

			categoryService.getTeamsByCategory($scope.currentCategory.id)
			.then(function(result){
				$scope.teamList = result.map(function(team){
					team.participants_in_group = team.group.participant_team
					return team
				})

				//filtro para obtener equipos
				//FIXME: no se está enviando la subdiscipline_id
				var teamQuery = {
					category_type_id: $scope.currentCategory.category_type_id
					,gender_id: $scope.currentCategory.gender_id
					// ,subdiscipline_id: $scope.currentCategory.subdiscipline_id
				}

				return teamService.get(teamQuery)
			})
			.then(function(result){
				var teams = result.data.data
				var teamsInCategory = $scope.teamList.map(function(t){ return t.team_id})
				//se filtran los equipos que no estén ya inscritos en la categoria
				$scope.availableTeams = teams.filter(function(t){
					return !teamsInCategory.includes(t.id)
				})
			})

			//utilizado para la directiva teamslot available
			// categoryService.getCategoryPhaseTeam($scope.currentCategory)
			// .then(function(result){
			// 	$scope.phaseTeamList = result
			// })


		}

		var init = function(){
			$scope.currentPlayer = {}
			$scope.playerEvents = {}

			//se cargan los estatus posibles del equipo, para la parte de management
			//es posible brincarse esta consulta si el usuario no es admin
			coreService.getStatus('pre-registration')
			.then(function(result){
				$scope.statusTypes = result.data.data
			})

			if($stateParams.teamId && $stateParams.categoryId){
				categoryService.getSummonedPlayerList($stateParams.categoryId, $stateParams.teamId)
				.then(function(summonedPlayers) {
					// TODO: Filtrar los players_team que sean de este equipo
					$scope.summonedPlayers = summonedPlayers.data.data
				})
			}

			//se carga para mostrar el perfil del equipo
			if(team) $scope.team = team.data.data

			if(currentCategory) {
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

		$scope.setTeamToGroup = function(team, group) {
			//Set team to the group
			var data = {}
			data.category_id = $scope.currentCategory.id
			data.team_id = team.id
			data.phase_id = $scope.phaseInit.id
			data.active = !team.assigned
			data.id = team.teamPlayingCategoryId
			$scope.saveTeamToGroup(data)
		}

		$scope.saveTeamToGroup = function(data) {
			//UPDATE TEAMS ON CATEGORY
			if(data.id > 0){
				categoryService.updateTeamToCategoryInvite(data)
				.then(function(result){
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
			else{
				categoryService.createTeamToCategoryInvite(data)
				.then(function(result){
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

//------------------------------------------------------------------------------
// Team status management
//------------------------------------------------------------------------------

		//para hacer toggle de payment, document y de roster
		$scope.toggleTeamAttr = function(attrName, teamData){
			teamData[attrName] = !teamData[attrName]
			$scope.saveTeamStatus(teamData)
		}

		//salva los cambios realizados en tabla spider
		$scope.saveTeamStatus = function(data){

			let teamData = {}
			if(data.id != undefined) teamData.id = data.id
			if(data.category_id != undefined) teamData.category_id = data.category_id
			if(data.team_id != undefined) teamData.team_id = data.team_id
			if(data.status_id != undefined) teamData.status_id = data.status_id
			if(data.phase_id != undefined) teamData.phase_id = data.phase_id
			if(data.group_id != undefined) teamData.group_id = data.group_id
			if(data.active != undefined) teamData.active = data.active
			if(data.payment != undefined) teamData.payment = data.payment
			if(data.document != undefined) teamData.document = data.document
			if(data.roster != undefined) teamData.roster = data.roster
			if(data.position_in_group != undefined) teamData.position_in_group = data.position_in_group

			categoryService.saveTeamStatus(teamData)
			.then(function(result){
				$rootScope.changesSaved()
				loadCategory()
			})
		}

		$scope.addTeamToCategory = function(data){
			var teamData = {}
			teamData['category_id'] = $scope.currentCategory.id
			teamData['phase_id'] = $scope.initialPhase.id
			teamData['team_id'] = data.id
			teamData['group_id'] = data.group_id
			teamData.status_id = 1 //in process
			categoryService.addTeamToCategory(teamData)
			.then(function(result){
				$('#addTeamModal').modal('hide')
				$rootScope.changesSaved()
				loadCategory()
			})
		}

		//alterna el estado summoned de un jugador, para usarlo en el listado
		//de jugadores
		$scope.toggleSummon = function(player){
			var data = {
				category_id: $scope.currentCategory.id
				,team_id: player.team_id
				,player_id: player.player_id
			}

			//en caso de que el jugador exista, se alterna el campo active,
			//para indicar si esta summoned o no.
			//si el jugador no existe en la lista de summoned, el campo active
			//se setea en true por defecto
			if(player.summoned && player.summoned.id){
				 data['id'] = player.summoned.id
				 data['active'] = !player.summoned.active
			 }

			return categoryService.saveSummonedPlayer(data)
			.then(function(result){
				player.summoned = result.data.data
				return player
			})
		}

		//obtiene la lista de jugadores convocados para esta unitaria,
		//con el id de la categoria precargado
		$scope.getSummonedPlayerList = function(teamId){
			var roster = null

			teamService.getTeamRoster(teamId)
			.then(function(result){
				roster = result.data.data
				return categoryService.getSummonedPlayerList($scope.currentCategory.id, teamId)
			})
			.then(function(result){
				var summonedPlayers = result.data.data

				//se cruza el roster contra la lista de convocados
				$scope.teamRoster = roster.map(function(player){
					var summoned = summonedPlayers.find(function(p){
						return p.player_id == player.player_id
					})

					//si el jugador del roster actual esta convocado,
					//se coloca la info del convocado en el objeto
					if(summoned != undefined) player.summoned = summoned
					return player
				})
			})
		}

		$scope.resetTeamSelected = function(){
			$scope.teamSelected = null
		}
}])
