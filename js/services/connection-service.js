app.service('connectionService', ['$http'
	,'$log'
	,'envService'
	,'$rootScope'
	,'$httpParamSerializer'
	,function($http
	,$log
	,envService
	,$rootScope
	,$httpParamSerializer
	){

	var baseUrl = envService.read('apiUrl')

	var errorHandler = function(error){
		switch (error.status) {
			case 400:
				throw error
				break;
			case 404:
				throw error
				break;
				// case 500:
			default:
				console.log(error);
				throw new Error(error.status + " " + error.statusText)
		}
	}

	this.getQueryString = function(obj){
		 return $httpParamSerializer(obj)
	}

	this.get = function(request) {
		var config = {
			method:"GET",
			url: baseUrl + request,
			headers: {'Content-Type': 'application/json;charset=utf-8'}
		}

		if($rootScope.currentUser && $rootScope.currentUser['Authorization-Token'])
			//config.headers = {'Authorization-Token': $rootScope.currentUser['Authorization-Token']
			config.headers['Authorization-Token'] = $rootScope.currentUser['Authorization-Token']

		return $http(config)
		.then(function(result){
			return result;
		})
		.catch(errorHandler)
	}

	this.post = function(serviceUrl, dataObj) {
		var url = baseUrl + serviceUrl;
		var config = {
			method: 'POST',
			url: url,
			data: dataObj,
			headers: {'Content-Type': 'application/json;charset=utf-8'}
		}

		if($rootScope.currentUser && $rootScope.currentUser['Authorization-Token']){
			config.headers['Authorization-Token'] = $rootScope.currentUser['Authorization-Token']
		}

		return $http(config)
		.then(function(response, status, header, config){
			return response
		})
		.catch(errorHandler)
	}

	this.put = function(serviceUrl, dataObj) {
		var url = baseUrl + serviceUrl;
		var config = {
			method: 'PUT',
			url: url,
			data: dataObj,
			headers: {'Content-Type': 'application/json;charset=utf-8'}
		}

		if($rootScope.currentUser && $rootScope.currentUser['Authorization-Token'])
			config.headers['Authorization-Token'] = $rootScope.currentUser['Authorization-Token']

		var url = baseUrl + serviceUrl;

		return $http(config)
		.then(function(response){
			return response
		})
		.catch(errorHandler)
	}
}])
