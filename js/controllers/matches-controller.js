var matchesModule = angular.module('matchesModule', [])

matchesModule.controller('matchesController',
		['$rootScope'
		 ,'$scope'
		 ,'$state'
		 ,'$location'
		 ,'$anchorScroll'
		 ,'$log'
		 ,'connectionService'
		 ,'currentCategory'
		 ,'categoryService'
		 ,'teamService'
		 ,'matchService'
		 ,'lodash'
		 ,'groupService'
		 ,'$stateParams'
	,function($rootScope
			,$scope
			,$state
			,$location
			,$anchorScroll
			,$log
			,connectionService
			,currentCategory
			,categoryService
			,teamService
			,matchService
			,_
			,groupService
			,$stateParams
		) {

		$scope.currentCompetitionId = $stateParams.competitionId
		$scope.currentPhase = null
		$scope.currentGroup = null
		$scope.placeholders = null
		$scope.placeholder_home = null
		$scope.placeholder_visitor = null

		var init = function(){
			//this promise chain injects groups into the category,
			categoryService.getCategoryWithGroups(currentCategory.data.data.id)
			.then(function(r){
				$scope.currentCategory = r
				return $scope.currentCategory
			})
			.then(function(category){
				//then flattens the data, and builds the match table
				$scope.table = category.phases.reduce(function(prev, phase){
					//TODO: filter groups on core
					//filters out the group clicked on schedule page

					var thisGroup = phase.groups.filter(function(g){
						return g.id == $state.params.groupId
					})

					//if the group i've just clicked is found, let's push the matches
					if(thisGroup.length > 0){
						$scope.currentGroup = thisGroup[0]
						$scope.currentPhase = phase

						thisGroup.forEach(function(group){
							group.matches.forEach(function(match){
								var generateLabel = function(type){
									//FIXME: TRANSLATE
									var label = 'Unassigned'

									if(match[type + '_team_id'] != null){
										label = match[type + '_team'].name
									}
									else if(match[`placeholder_${type}_team_position`] != null){
										label = match[`placeholder_${type}_team_position`] + ' of group ' + match[`placeholder_${type}_team_group`]
									}
									return label;
								}

								match.home_team_label = generateLabel('home')
								match.visitor_team_label = generateLabel('visitor')

								prev.push({match: match, group: group, phase: phase })
							})
						})
					}
					return prev
				}, [])
				return category
			})

			//TODO: CHANGE THIS
			//list of referees. right now we're getting all users
			connectionService.get('user')
			.then(function(result){
				$scope.userList = result.data.data
			})
		}

		init()

		//==========================================================================
		// CRUD stuff
		//==========================================================================

		//para manejo de los forms en el template activo
		$scope.form = {}

		$scope.save = function(match){
			match.group_id = $scope.currentGroup.id

			matchService.saveMatch(match)
			.then(function(result){
				$rootScope.displayMessage('Match saved', 'success')
				$('#matchModal').modal('hide')
			})
			.catch(function(error){
				console.log(error)
				$rootScope.displayMessage(error.data, 'danger')
			})

			init() 	//refresh all data
		}

		var loadPlaceholdersForMatch = function(match){
			//se buscan los placeholders para esta categoría
			connectionService.get(`category/${$scope.currentCategory.id}/team_placeholders`)
			.then(function(result){
				$scope.placeholders =
					result.data.data
					//se extraen los placeholders para esta fase
					.filter(function(p){ return p.phase_id == $scope.currentPhase.id })[0]
					.groups.map(function(g){
						return g.positions.map(function(pos){
							return {
								group_id: g.group_id
								,group_name: g.name
								,position: pos.position
								,name: pos.description
							}
						})
					})
					// se normaliza la respuesta a un array de un nivel; el paso anterior retorna -> [[],[]]
					.reduce(function(acum, group){
						group.map(function(g){ acum.push(g) })
						return acum
					}, [])
			})
			.then(function(result){
				//se setean los valores de los select para los placeholders
				if(match.placeholder_home_team_group && match.placeholder_home_team_position){
					var home_placeholder = $scope.placeholders.filter(function(p){
						return p.group_id == match.placeholder_home_team_group
							&& p.position == match.placeholder_home_team_position
					})
					match.placeholder_home = home_placeholder[0]
				}

				if(match.placeholder_visitor_team_group && match.placeholder_visitor_team_position){
					var visitor_placeholder = $scope.placeholders.filter(function(p){
						return p.group_id == match.placeholder_visitor_team_group
							&& p.position == match.placeholder_visitor_team_position
					})
					match.placeholder_visitor = visitor_placeholder[0]
				}
			})
		}

		//Solo se cargan los equipos inscritos en cada grupo
		var loadTeamsForMatch = function(groupId){
			groupService.getTeamsByGroup($scope.currentGroup.id)
			.then(function(teamList){
				$scope.teamList = _.uniq(teamList)
			})
		}

		$scope.new = function(match){
			$scope.match = {}
			$scope.match.date = moment(moment().toDate()).format()
			$scope.matchDateShow = moment($scope.match.date).format($rootScope.formatDateTime)
			loadTeamsForMatch()
			if($scope.currentPhase.position != 1) loadPlaceholdersForMatch($scope.match)
		}

		$scope.edit = function(row){
			$scope.match = {}
			$scope.currentPhase = row.phase
			$scope.currentGroup = row.group
			$scope.match = row.match
			loadTeamsForMatch()
			if($scope.currentPhase.position != 1) loadPlaceholdersForMatch($scope.match)

			$scope.match.category_id = $scope.currentPhase.category_id
			$scope.match.phase_id = $scope.currentPhase.id
			$scope.match.group_id = $scope.currentGroup.id

			$scope.match._datePickerOpen = false
		}

		$scope.selectMatchDate = function(date) {
			$scope.match.date = moment(date).format();
			$scope.matchDateShow = moment($scope.match.date).format($rootScope.formatDateTime);
			//Validate that date is on season's date
		}

		$scope.teamChanged = function(isHome, home_team_id, visitor_team_id) {
			if (isHome && home_team_id == visitor_team_id) {
				$scope.match.visitor_team_id="";
			}
			if (!isHome && home_team_id == visitor_team_id) {
				$scope.match.home_team_id="";
			}
		}
	}
])
