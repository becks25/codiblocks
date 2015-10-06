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

app.controller('PageCtrl', function ($scope, AuthService, $state, page, ClassFactory, SPRITES) {
  $scope.page = page;  

  $scope.squareSize = ($window.innerWidth/2)*8/10;

  Crafty.load(['/images/sprites.png']);
  Crafty.init($scope.squareSize * 8, $scope.squareSize*8);
  Crafty.canvas.init()

  Crafty.sprite(64, '/images/sprites.png', SPRITES);

  $scope.level = new ClassFactory.Level($scope.page);


  $scope.resetLevel = function(){

  }

  $scope.runSpell = function(){

  }

});
