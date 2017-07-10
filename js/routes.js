app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

	$stateProvider
		//==========================================================================
		//  Generic states
		//==========================================================================

		.state('forbidden', {
			url: '/forbidden',
			templateUrl: 'html/forbidden.html',
			data: {
				requireLogin: false
			}
		})

		.state('404', {
			url: '/404',
			templateUrl:'html/404.html',
			data: {
				requireLogin: false
			}
		})

		//==========================================================================
		//  Base states
		//==========================================================================
		.state('root', {
			url: '/',
			templateUrl: 'html/index.html',
			controller: 'mainController',
			data: {
				requireLogin: false
			}
		})

	// $urlRouterProvider.otherwise('/');
	$locationProvider.html5Mode(true);
})
