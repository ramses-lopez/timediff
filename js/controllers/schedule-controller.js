var scheduleModule = angular.module('scheduleModule', [])

scheduleModule.controller('scheduleController', ['$rootScope'
	,'$state'
	,'$log'
	,'$scope'
	,'connectionService'
	,'envService'
	,'$http'
	,'$translate'
	,'$stateParams'
	,'categoryService'
	,'groupService'
	,'currentCategory'
	,'disciplineService'
	,'matchService'
	,function($rootScope
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
		,currentCategory
		,disciplineService
		,matchService
	) {

	$scope.currentCompetitionId = $stateParams.competitionId

	var init = function(){
		categoryService.getMatches($stateParams.categoryId)
		.then(function(result){
			$scope.currentCategory = result
		})
	}

	var refreshCategory = function(){
		init()
	}

	$scope.getMatchStats = function(match, subdiscipline_id){

		match.stats = {}

		// Gets all the events in this match and summarize them
		match.events.forEach(function(matchEvent){
			console.log('level',matchEvent.event.level);
			if (matchEvent.event.level == 1) {
				team = (matchEvent.team_id == match.home_team_id ? 'home_team' : 'visitor_team')
				eventStat = match.stats[matchEvent.event.name]
				eventStat = eventStat || {}
				eventStat.name = matchEvent.event.name
				eventStat[team] = eventStat[team] || {}
				eventStat[team].count = eventStat[team].count ? ++eventStat[team].count : 1
				eventStat.img_url = matchEvent.event.img_url
				match.stats[matchEvent.event.name] = eventStat
			}
		})

		// Gets all the events for this subdiscipline and adds them to the stats with a default value of 0
		disciplineService.getEventsBySubdiscipline(subdiscipline_id)
		.then(function(disciplineEvents){
			disciplineEvents.forEach(function (disciplineEvent) {
				if(disciplineEvent.level == '1'){
					teams = ['home_team','visitor_team']
					teams.forEach(function(team){
						match.stats[disciplineEvent.name] = match.stats[disciplineEvent.name] || {}
						match.stats[disciplineEvent.name].name = disciplineEvent.name
						match.stats[disciplineEvent.name].img_url = disciplineEvent.img_url
						match.stats[disciplineEvent.name][team] = match.stats[disciplineEvent.name][team] ? match.stats[disciplineEvent.name][team] : {}
						match.stats[disciplineEvent.name][team].count = match.stats[disciplineEvent.name][team].count ? match.stats[disciplineEvent.name][team].count : 0
					})
				}
			})
		})

		$scope.currentMatch = match
	}

	init()

	//==========================================================================
	// Phase
	//==========================================================================

	$scope.phase = {}

	$scope.newPhase = function(){
		$scope.phase = {
			category_id: $scope.currentCategory.id
			,position: $scope.currentCategory.phases.length + 1
			,classified_team: 1
			,participant_team: 1 }
	}

	$scope.editPhase = function(phase){
		console.log('fase a editar', phase);
		$scope.phase = phase
	}

	$scope.savePhase = function(phase){

		const phaseData = angular.copy(phase)
		delete phaseData.groups

		categoryService.savePhase(phaseData)
		.then(function(result){
			refreshCategory()
			$scope.phase = {}
			$rootScope.changesSaved()
			$('#phaseModal').modal('hide')
		})
		.catch(function(error){
			console.error(error)
		})
	}

	//==========================================================================
	// Group
	//==========================================================================

	$scope.group = {}

	$scope.newGroup = function(phase){
		$scope.group = { phase_id: phase.id
			,classified_team: 1
			,participant_team: 1
		 }
	}

	$scope.editGroup = function(group){
		$scope.group = group
	}

	$scope.replacePlaceholders = function(group){
		groupService.replacePlaceholders(group.id)
		.then(function(){
			$rootScope.changesSaved()
			refreshCategory()
		})
	}

	$scope.saveGroup = function(group){
		var data = {
			id: group.id
			,name: group.name
			,phase_id: group.phase_id
			,classified_team: group.classified_team
			,participant_team: group.participant_team
		}

		categoryService.saveGroup(data)
		.then(function(result){
			$rootScope.changesSaved()
			$scope.group = {}
			$('#groupModal').modal('hide')
			refreshCategory()
		})
		.catch(function(error){
			console.error(error)
		})
	}

	$scope.deleteGroup = function(group){
		var data = {
			id: group.id
			,active: false
		}
		categoryService.saveGroup(data)
		.then(function(result){
			$rootScope.displayMessage('Group deleted', 'success')
			$scope.group = {}
			$('#groupModal').modal('hide')
			refreshCategory()
		})
		.catch(function(error){
			console.error(error)
		})
	}

}])
