
var authModule = angular.module('authModule', []);

authModule.controller('resetAuthController', ['$rootScope', '$scope', 'authService', '$location', '$state', '$translate', '$timeout',
	function($rootScope, $scope, authService, $location, $state, $translate, $timeout)
{
	$scope.user = {}
	$scope.user.username = $state.params.username	

    $scope.resetPass = function(user)
    {
    	//Call reset password if passwords are equals
    	if( user.newPassword === user.againPassword)
    	{
    		user.password = user.newPassword
    		authService.resetPassword($state.params.username, user.password, $state.params.token)
    		.then(function(results) {
				if($rootScope.currentUser != undefined)
				{
					$translate('RESET_PASSWORD.SUCCESS').then(function (msg) {
						$rootScope.displayMessage(msg, 'success')
					});
					$state.go('root')
				}	
			})
			.catch(function(response){
				console.error('error',response)
				$scope.messageError = response.status == 404 ? 'RESET_PASSWORD.FAILURE' : 'RESET_PASSWORD.ERROR'
				$translate($scope.messageError).then(function (msg) {
						$rootScope.displayMessage(msg, 'danger')
					});
			})
    	}
    }
}]);
