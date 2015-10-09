app.config($stateProvider => {
    $stateProvider.state('page', {
        url: '/page/:id',
        resolve: {
            page: (PageFactory, $stateParams) => PageFactory.find($stateParams.id)
        },
        views: {
            main: {
                templateUrl: 'js/page/page.html',
                    controller: 'PageCtrl'

            }
        }
    });

});

app.controller('PageCtrl', ($scope, AuthService, $state, page, ClassFactory, SPRITES, LevelFactory, TilesizeFactory, SpellFactory, SpellComponentFactory, SPRITE_AVATARS, orderByFilter) => {
    $scope.page = page;
    $scope.spellComponents = []; // update from db if saved version is present
    $scope.spellVars = [];
    $scope.spellTools = [];
    $scope.directions = [{
        name: 'up',
        text: 'up',
        value: false,
        type: 'direction'
    }, {
        name: 'down',
        text: 'down',
        value: false,
        type: 'direction'

    },
        {
            name: 'left',
            text: 'left',
            value: false,
            type: 'direction'

        },
        {
            name: 'right',
            text: 'right',
            value: false,
            type: 'direction'
        }];

    //this is for testing ig spell directions is working...
    //$scope.spellDirections = [];
    $scope.spellComponentDirs = [];

    //scope.page.tools is an array of strings - .action of the objs
    // takes vars and tools from page model and makes command objs
    // pushes each obj to spellTools arr
    var spellToolConstr = () => {
        $scope.page.tools.forEach((tool)=> {
            var newTool = SpellComponentFactory.makeToolObj(tool);
            $scope.spellTools.push(newTool);
        });
    };
    //construct the spellTools arr on load
    spellToolConstr();

    var spellVarConstr = () => {

        //variables are stored as strings
        $scope.page.variables.forEach((variable)=> {
            var name = variable.split(' ').join('');
            $scope.spellVars.push({name: name, text: variable, value: false, type: 'variable'})
        });
    };

    spellVarConstr();


    var refresh = () => {
        $scope.$watchCollection('spellComponents', () => {
            $scope.spellTools = orderByFilter($scope.spellTools, ['text']);
        });
        $scope.$watchCollection('spellVars', () => {
            $scope.spellVars = orderByFilter($scope.spellVars, ['text']);
        });
        $scope.$watchCollection('directions', () => {
            $scope.directions = orderByFilter($scope.directions, ['text']);
        });

        $scope.$watchCollection('spellComponentDirs', () => {
            $scope.spellComponentDirs = orderByFilter($scope.spellComponentDirs, ['text']);
        });
    };
    refresh();

//save a copy of all tools on the scope
    $scope.tools = $scope.spellTools.slice();

//remove a tool from the spell
    $scope.removeFromSpell = (index) => {
        $scope.spellComponents.splice(index, 1);
      };

//remove a variable from the tool
//this will need to change as soon as correctly adding vars to tools
    $scope.removeFromTool = (index) => {
        $scope.spellComponentDirs.splice(index, 1);
      };

    var baseConfig = {
        placeholder: "beingDragged",
        tolerance: 'pointer',
        revert: 100
    };


//add tools to the spell components array
    $scope.toolConfig = angular.extend({}, baseConfig, {
        update: (e, ui) => {
            if (ui.item.sortable.droptarget.hasClass('first')) {
                ui.item.sortable.cancel();
                refresh();
            }
        },
        stop: (e, ui) => {

            if (e.target) {
                if ($(e.target).hasClass('first')) {
                    $scope.spellTools = $scope.tools.slice();
                    refresh();
                }
            }
        },
        connectWith: ".spellComponents"
    });



    $scope.spellConfig = angular.extend({}, baseConfig, {
        connectWith: ".spellTools"
    });

//this currently only handles adding directions
  //drag directions to tools

 //save a copy of the directions
  $scope.spellDirsBox = $scope.directions.slice();

  $scope.dirConfig = angular.extend({}, baseConfig, {
        update: (e, ui) => {
          console.log("this is the ui item", ui.item)
            if (ui.item.sortable.droptarget.hasClass('first')) {
                ui.item.sortable.cancel();
                refresh();
            }
        },
        stop: (e, ui) => {
            if ($(e.target).hasClass('first')) {
                $scope.directions = $scope.spellDirsBox.slice();
                refresh();
            }
        },
        connectWith: ".spellComponentDirs"
    });


    $scope.dirComponentConfig = angular.extend({}, baseConfig, {
        connectWith: ".spellDirs"
    });



    //this handles dragging variables to tools

    //save a copy of the spellVars
  $scope.spellVarsBox = $scope.spellVars.slice();

  $scope.varConfig = angular.extend({}, baseConfig, {
        update: (e, ui) => {
          console.log("this is the ui item", ui.item)
            if (ui.item.sortable.droptarget.hasClass('first')) {
                ui.item.sortable.cancel();
                refresh();
            }
        },
        stop: (e, ui) => {
            if ($(e.target).hasClass('first')) {
                $scope.spellVars = $scope.spellVarsBox.slice();
                refresh();
            }
        },
        connectWith: ".spellComponentDirs"
    });


    $scope.dirComponentConfig = angular.extend({}, baseConfig, {
        connectWith: ".spellVars"
    });



    //made some changes
    TilesizeFactory.NumTiles = $scope.page.gameboard.length;
    Crafty.load(['/images/sprites.png']);
    Crafty.init(TilesizeFactory.TILESIZE * TilesizeFactory.NumTiles, TilesizeFactory.TILESIZE * TilesizeFactory.NumTiles);

    Crafty.canvas.init();

    Crafty.sprite(64, '/images/sprites.png', SPRITES);
    Crafty.sprite(64, '/images/SpriteAvatars.png', SPRITE_AVATARS);

    $scope.level = new LevelFactory($scope.page);
    $scope.spell = new SpellFactory($scope.level);


    $scope.resetLevel = function () {
        $scope.level.map.resetMap();
    };


    $scope.grid = new Array(TilesizeFactory.NumTiles * TilesizeFactory.NumTiles);


    $scope.size = TilesizeFactory.TILESIZE + 'px';

    $scope.runSpell = argArr => $scope.spell.run(argArr);

    $scope.stepThrough = (argArr)=> {
        $scope.spell.stepThrough(argArr);
    };


});
