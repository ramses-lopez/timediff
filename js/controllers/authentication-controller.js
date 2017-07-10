
var authModule = angular.module('authModule', []);

authModule.controller('authCtrl', ['$log', '$rootScope', '$scope', 'authService', '$location', '$state',
	function($log, $rootScope, $scope, authService, $location, $state)
{
	if($rootScope.currentUser){
		console.debug('user logged in, redirecting to competition state')
		$state.go('competition/list')
	}

	$scope.user = {}

	$scope.missingField = function()
	{
		//	$log.info('Missing Field: ' , $location.path() );

		if($location.path() === '/login')
		{
			$log.info('/login');
			if(!($scope.loginUser && $scope.loginPass))
				return false;
			else
				return true;
		}
		if($location.path() === '/register'){
			if(!($scope.registerUser && $scope.registerEmail && $scope.registerPass))
				return false;
			else
				return true
			;
		}
		if($location.path() === '/forgotPass'){
			if(!($scope.forgotPassUserName === ""))
				return false;
			else
				return true;
		}

	}

	//TODO: metodo duplicado en la directiva login-form / eliminar este
	$scope.login = function (user){
		authService.login($scope.user.username, $scope.user.password)
		.then(function(results) {
			$rootScope.currentUser = results.data.data
			localStorage.setItem('currentUser', JSON.stringify($rootScope.currentUser))
		})
		.catch(function(response){
			$log.error('error',response)
			var errorMsg = response.status == 404 ? 'LOGIN.FAILURE' : 'LOGIN.ERROR'

			console.log(errorMsg)

			$translate(errorMsg).then(function (m) {
				$rootScope.displayMessage(m, 'danger')
			});

		})
	}

	$scope.signUp = function(){
		if($scope.missingField()){
			$log.warn("missingField");
			$scope.messageError='You need to sign up or sign in to continue';
		}
		else
			authService.signUp($scope.registerUserName, $scope.registerEmail, $scope.registerPass)
			.then(function(results){

				if(results.code !==  "0") {
					$scope.messageError = results.message;
				}
				else{
					$rootScope.currentUser = results
					$state.go('root')
				}
			})
			.catch(function(response){
				$scope.messageError = response.message;
			})
	}

	$scope.forgotPassword = function(){
		if($scope.missingField()){
			$log.warn("missingField");
		}
		else{
			authService.fogotPassword($scope.forgotPassUserName)
			.then(function(results){
				if(results.code !== "0") {
					$scope.isError = true;
					$scope.messageError = results.message;
				}
				else{
					$rootScope.currentUser = authService.getUser();
					$location.path('/login');
				}
			})
			.catch(function(response){
				$scope.messageError=response.message;
				$scope.isError = true;
			})
		}
	}
}])
