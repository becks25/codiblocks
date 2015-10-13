app.config($stateProvider => {
    $stateProvider.state('page', {
        url: '/page/:id',
        resolve: {
            page: (PageFactory, $stateParams) => PageFactory.find($stateParams.id),
            user: (UserFactory, AuthService) => {
                return AuthService.getLoggedInUser()
                .then(user => {
                    if(user) return UserFactory.find(user._id);
                    else return;

                })
              },
            allPages: (PageFactory) => PageFactory.findAll()
        },
        views: {
            main: {
                templateUrl: 'js/page/page.html',
                    controller: 'PageCtrl'

            }
        }
    });

});


app.controller('PageCtrl', ($scope, AuthService, $state, page, ClassFactory, SPRITES, LevelFactory, TilesizeFactory, SpellFactory, SpellComponentFactory, SPRITE_AVATARS, orderByFilter, $compile, user, AvatarFactory, PageFactory, allPages, $uibModal) => {
    $scope.page = page;
    $scope.allPages = allPages;
    console.log("all of the page", $scope.allPages);
    $scope.spellComponents = []; // update from db if saved version is present
    $scope.spellVars = [];
    $scope.spellTools = [];
    $scope.directions = [];
    if(user) $scope.user = user;
    else $scope.user = {character: { picture: 'Giraffe1', name: 'Omri'}}

    $scope.avatar = $scope.user.character.picture
    $scope.text = $compile($scope.page.text)($scope);
    angular.element(document.getElementById('storyText')).append($scope.text);

    $scope.hintRequested = false;

    $scope.getHint = () => {
      $scope.hintRequested = true;
    };

    $scope.nextPage;

  
    $scope.turnPage = () => {

      for (var i = 0; i < $scope.allPages.length; i++){
        if($scope.allPages[i].storyId === $scope.page.storyId){
          var nextPageNumber = $scope.page.pageNumber + 1;
          if($scope.allPages[i].pageNumber === nextPageNumber){
            $scope.nextPage = $scope.allPages[i];

          }
        }
      }

      PageFactory.find($scope.nextPage._id)
      .then(function(page){
        $state.go('page', {id: page._id})
      }) 
    }

    //this is for testing if spell directions is working...
    //$scope.spellDirections = [];
    $scope.spellComponentDirs = [];

    console.log("there is a user on scope", $scope.user.character.picture)

    //construct the directions with a function to fix drop and drag bug
    var spellDirConstr = () => {
      $scope.directions = [{
        name: 'up',
        text: 'up',
        value: false,
        type: 'direction',
        varType: 'direction'
      }, {
        name: 'down',
        text: 'down',
        value: false,
        type: 'direction',
        varType: 'direction'
      },
      {
        name: 'left',
        text: 'left',
        value: false,
        type: 'direction',
        varType: 'direction'
      },
      {
        name: 'right',
        text: 'right',
        value: false,
        type: 'direction',
        varType: 'direction'
      }];
    };
     spellDirConstr();

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
            var name = variable.text.split(' ').join('_');
            $scope.spellVars.push({name: name, text: variable.text, value: false, type: 'variable', varType: variable.varType})
        });
    };
    //construct the spellVars array on load
    spellVarConstr();

    //ensures that tool box can't be rearranged by reordering back to orig order
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
    $scope.removeFromSpell = (index, loc) => {
        loc.splice(index, 1);
        // console.log('remove')
        $scope.resetLevel();
      };

    // //remove a variable from the tool
    // //this will need to change as soon as correctly adding vars to tools
    // $scope.removeFromTool = (index) => {
    //     $scope.spellComponentDirs.splice(index, 1);
    //     $scope.resetLevel();

    //   };

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
        stop: (e, clone) => {

            if (e.target) {
                if ($(e.target).hasClass('first')) {
                    // $scope.spellTools = $scope.tools.slice();
                    //$scope.spellComponents = $scope.spellComponents.slice();
                    $scope.spellTools = [];
                    spellToolConstr();
                    refresh();
                    $scope.resetLevel();
                }
            }
        },
        connectWith: ".spellComponents, .spellCompExpr",
    });

    //Handles directions and variables
    //determines if dropped in a valid position and updates target object's property
    var dirStuff = [];
    var model = [];
    var dropTargetIndex;
    var newVar={};
    var parentArray;
    $scope.dirConfig = angular.extend({}, baseConfig, {
        //this only runs if valid drop
        update: (e, ui) => {
          // console.log("this is the e item", ui.item.scope());

          if (ui.item.sortable.droptarget.hasClass('first')) {
            console.log('hi')
            console.log(ui.item.sortable.droptarget)
            ui.item.sortable.cancel();
            refresh();
          } else {
              //set newVar to clone of dragged variable
              newVar = _.cloneDeep(ui.item.scope().tool);
              //sets parent array and drop index to keep track of what to modify
              dropTargetIndex = ui.item.sortable.droptarget.data('index');
              parentArray = ui.item.sortable.droptarget.scope().parent;

              //resets tools arrays to create duplication and ensure spell components are clones
              $scope.spellVars = [];
              spellVarConstr();
              $scope.directions = [];
              spellDirConstr();
              refresh();
              // $scope.resetLevel();
          }
        },
        stop: (e, ui) => {
            //runs on drop
            //this will only run if a tool is being dropped in a valid area            
            //set prop on droppee
            //checks that drop target can take this variable
            if(dropTargetIndex>-1 && parentArray[dropTargetIndex].hasOwnProperty(newVar.varType)){
                $scope.spellVars = [];
                spellVarConstr();
                $scope.directions = [];
                spellDirConstr();
                parentArray[dropTargetIndex][newVar.varType] = newVar.name;
                
                //reset variables
                newVar = null;
                parentArray = null;
                dropTargetIndex = -1;
                refresh();
                $scope.resetLevel();
            }
        },
        connectWith: ".spellCompVars"
    });

    //loads board and sprites based on screen size

    //overwrite gameboard hardcording to dynamically change avatar
    console.log("the gameboard", $scope.page.gameboard);
    for(var i = 0; i < $scope.page.gameboard.length; i++){
      for(var j = 0; j < $scope.page.gameboard[i].length; j++){
          if ($scope.page.gameboard[i][j].length && $scope.page.gameboard[i][j][0].type === "Avatar"){
            $scope.page.gameboard[i][j][0].name = $scope.user.character.picture;
          }
      }
    }
    
    TilesizeFactory.NumTiles = $scope.page.gameboard.length;
    Crafty.load(['/images/sprites.png']);
    Crafty.init(TilesizeFactory.TILESIZE * TilesizeFactory.NumTiles, TilesizeFactory.TILESIZE * TilesizeFactory.NumTiles);

    Crafty.canvas.init();

    

    Crafty.sprite(64, '/images/sprites.png', SPRITES);
    Crafty.sprite(64, '/images/SpriteAvatars.png', SPRITE_AVATARS);

    $scope.level = new LevelFactory($scope.page);
    $scope.spell = new SpellFactory($scope.level);
    //$scope.avatar = new AvatarFactory($scope.user.character.name);
    //console.log("the avatar yo", $scope.avatar)


    //console.log("so this is the pic", $scope.level.map.avatar.name)

    $scope.resetLevel = function () {
        $scope.spell.reset();
    };

    $scope.grid = new Array(TilesizeFactory.NumTiles * TilesizeFactory.NumTiles);

    $scope.size = TilesizeFactory.TILESIZE + 'px';

    var modalInstance;

    $scope.solved=false;
    $scope.runSpell = argArr => {
        $scope.spell.run(argArr)
        .then(res => {
            if(res){
                modalInstance = $uibModal.open({
                      animation:true,
                      templateUrl: 'js/common/directives/win-modal/win-modal.html',
                      controller: 'ModalCtrl'
                 });
                $scope.solved = true;
            }
        });

    };




    $scope.stepThrough = (argArr)=> {
        $scope.spell.stepThrough(argArr);
    };


});
