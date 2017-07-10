var portalModule = angular.module('portalModule', [])

portalModule.controller('portalController'
	,['$rootScope'
	,'$state'
	,'$log'
	,'$scope'
	,'connectionService'
	,'competitionService'
	,'categoryService'
	,'envService'
	,'$http'
	,'$translate'
	,'$stateParams'
	,'coreService'
	,function($rootScope
		,$state
		,$log
		,$scope
		,connectionService
		,competitionService
		,categoryService
		,envService
		,$http
		,$translate
		,$stateParams
		,coreService
	) {

	//==========================================================================
	// Basic params for this controller
	//==========================================================================

	$scope.competitionId = $state.params.competitionId
	$scope.seasonId = $state.params.seasonId
	$scope.categoryId = $state.params.categoryId

	// var config = {
	// 	method:"GET",
	// 	url: 'https://somosport-s3.s3.amazonaws.com/gallery1482867859321.json'
	// }
	//
	// $http(config).then(function(result){
	// 	$scope.galleryArray = result.data.data;
	// });

	$scope.openGalleryModal = function(name,imgUrl){
		$scope.currentTeamName = name;
		$scope.currentImageUrl = imgUrl;
	}

	$scope.currentSeason = null;
	$scope.currentCategory = null;

	if($scope.categoryId){
		categoryService.getFeedByCategory($scope.categoryId)
		.then(function(result){
			$scope.categoryFeed = result
		})

		//FIXME: el current category se esta cargando en las paginas del portal de
		//categoria, hay que normalizar esto
		categoryService.get($scope.categoryId)
		.then(function(result){
			$scope.currentCategory = result.data.data
		})


	}

	//==========================================================================
	// Internal functions
	//==========================================================================

	var getCompetitionByID = function(id) {
		competitionService.getCompetition(id)
		.then(function(results) {
			if(results.data.code != "0" || !results.data.data) {
				$state.go('root')
			}
			else {
				$scope.competition = results.data.data
				$rootScope.backgroundImage = $scope.competition.portraitUrl || '/img/field-background.jpg'
				// $scope.competition.seasons.map(getCategoriesBySeason)
			}
		})
		.catch(function(error){
			$translate('COMPETITION.NOT_FOUND')
			.then(function (errorMsg) {
				$rootScope.displayMessage(errorMsg, 'danger')
			});
			$state.go('root')
		})
	}

	//==========================================================================
	// Portal Initialization
	//==========================================================================

	getCompetitionByID($scope.competitionId)

	//==========================================================================
	// competition management
	// estas funciones manejan el CRUD De competiciones, temporadas y categorias
	//==========================================================================

	coreService.getGenders()
	.then(function(result){
		$scope.genders = result.data.data
	})

	coreService.getCategoryTypes()
	.then(function(result){
		$scope.categoryTypes = result.data.data
	})

	coreService.getClassificationTypes()
	.then(function(result){
		$scope.classificationTypes = result.data.data
	})

	//==========================================================================
	// Season
	//==========================================================================

	$scope.season = {}
	$scope.newSeason = function(){
		$scope.season = {}
	}

	$scope.editSeason = function(season){
		season.init_at = parseDate(season.init_at)
		season.ends_at = parseDate(season.ends_at)
		$scope.season = season
	}

	$scope.saveSeason = function(season){
		season.competition_id = $scope.competitionId

		competitionService.createSeason(season)
		.then(function(result){
			$rootScope.displayMessage('Season created', 'success')
			$scope.season = {}
			getCompetitionByID($scope.competitionId)
			$('#seasonModal').modal('hide')
		})
		.catch(function(error){
			$rootScope.displayMessage('Something went wrong', 'danger')
			console.error(error)
		})
	}

	//para convertir las fechas antes de setearlas en los forms
	var parseDate = function(date){
		return date ? new Date(date) : null
	}

	//==========================================================================
	// Category
	//==========================================================================
	$scope.category = {}

	$scope.newCategory = function(season){
		$scope.category = { season_id: season.id }
	}

	$scope.editCategory = function(category){
		category.inscription_init_at = parseDate(category.inscription_init_at)
		category.inscription_ends_at = parseDate(category.inscription_ends_at)
		$scope.category = category
	}

	$scope.saveCategory = function(category){
		categoryService.createCategory(category)
		.then(function(result){
			$rootScope.displayMessage('Category created', 'success')
			$scope.category = {}
			getCompetitionByID($scope.competitionId)
			$('#categoryModal').modal('hide')
		})
		.catch(function(error){
			console.error(error)
		})
	}

	//para setear los valores minimos y maximos de edad al cambiar la categoria
	//tambien setea el ID del tipo de categoria en el objeto category
	$scope.categoryTypeChange = function(cat){
		$scope.category.category_type_id = cat.id
		$scope.category.participant_minimum = cat.minimum_value
		$scope.category.participant_maximum = cat.maximum_value
	}

	//==========================================================================
	// Datepicker controls for season
	//==========================================================================

	$scope.seasonDateOptions = {
		start: {
			minDate: new Date()
			,isOpen: false
		}
		,end: {
			minDate: new Date()
			,isOpen: false
		}
	}

	$scope.categoryDateOptions = {
		start: {
			minDate: new Date()
			,isOpen: false
		}
		,end: {
			minDate: new Date()
			,isOpen: false
		}
	}

	$scope.openSeasonInitDP = function() { $scope.seasonDateOptions.start.isOpen = true }
	$scope.openSeasonEndDP = function() { $scope.seasonDateOptions.end.isOpen = true }
	$scope.openCategoryInitDP = function() { $scope.categoryDateOptions.start.isOpen = true }
	$scope.openCategoryEndDP = function() { $scope.categoryDateOptions.end.isOpen = true }

}])
