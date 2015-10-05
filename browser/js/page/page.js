app.config(function ($stateProvider) {
    $stateProvider.state('page', {
        url: '/page/:id',
        templateUrl: 'js/page/page.html',
        resolve: {
          page: (PageFactory, $stateParams) => PageFactory.find($stateParams.id)
        },
        controller: 'PageCtrl'
    });
});

app.controller('PageCtrl', function ($scope, AuthService, $state, page, Class) {
  $scope.page = page;
  console.log($scope.page.story);

  $scope.app = Class.App.start();

});
