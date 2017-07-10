var userModule = angular.module('userModule', [])

userModule.controller('userController', ['$rootScope',
		'$state',
		'$log',
		'$scope',
		'connectionService',
		'competitionService',
		'envService',
		'$http',
		'$translate',
		'$stateParams',
		'user',
		'currentCategory',
		'playerService',
	function($rootScope,
		$state,
		$log,
		$scope,
		connectionService,
		competitionService,
		envService,
		$http,
		$translate,
		$stateParams,
		user,
		currentCategory,
		playerService) {

		$scope.user = user

		if(user){
			playerService.getEventsByPlayer(user.id ,currentCategory.data.data.id).then(function(r){
				playerEvents = r.data.data

				playerEvents.forEach(function(playerEvent){
					teamId = playerEvent.team_id
					homeTeam = playerEvent.match_id.home_team
					visitorTeam = playerEvent.match_id.visitor_team
					if (teamId == homeTeam.id) {
						playerEvent.own_team = homeTeam
						playerEvent.against_team = visitorTeam
					}
					else {
						playerEvent.own_team = visitorTeam
						playerEvent.against_team = homeTeam
					}
				})

				$scope.playerEvents = playerEvents

			})
		}
	}]
)
