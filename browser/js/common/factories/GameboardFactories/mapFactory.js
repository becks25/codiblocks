/**
 * Created by Austin on 10/5/15.
 */
app.factory('MapFactory', function(ClassFactory, TilesizeFactory) {
    class Map {
        // fat arrows allow for this to reference MapFactory and not the inner function
        constructor (mapData) {
            this.originalMap = mapData;
            this.avatar = null;
            this.objects = [];
            this.mapArray = this.makeBoard();

            this.load(mapData);
        }

        makeBoard (){
            var board = [];
            for(var i=0; i<TilesizeFactory.NumTiles; i++){
                board.push([]);
                for(var j=0; j<TilesizeFactory.NumTiles; j++){
                    board[i].push([]);
                } 
            }
            return board;
        }

        resetMap(){
            Crafty("2D").each(function(i) {
                    this.destroy();
                
            });
            this.load(this.originalMap);
        }

        getAvatar (){
            return this.avatar
        }

        // position is an object with x and y coordinates
        getObject (position, type) {
          var objs = this.getObjects(position);
          for (var i = 0; i < objs.length; i++) {
              if(objs[i].type === type) {
                  return objs[i];
              }
          }
            return null;
        }

        getObjects (position) {
            return this.mapArray[position.x][position.y];
        }

        addObject (obj, position) {
            this.removeObject(obj);
            this.objects.push(obj);
            this.mapArray[position.x][position.y].push(obj);
        }

        removeObject (obj) {
            var index= -1;
            this.objects.forEach((item, i) => {
                if(item.name === obj.name){
                    index= i;
                }
            });
            this.objects.splice(index, 1);

        }

        arrayRemove (array, obj) {
            var index = array.indexOf(obj);
            if(index > -1) {
                array.splice(index, 1);
            }
            return array;
        }

        load (mapData) {
            var x, y;
            var len = mapData.length;
            for(x = 0; x< len; x++) {
                for(y = 0; y < len; y++) {
                    mapData[x][y].forEach(object => {
                        this.loadObject(object, x, y);
                    })
                }
            }
        }

        loadObject (key, x, y) {
            var obj = this.createObject(key, x, y);
            if(obj) {
                if(obj.type === 'Avatar' )
                    this.avatar = obj;
            }
            obj.setMap(this);
            var position = {x: x, y: y};

            obj.setMapPos(position);
        }

        createObject (obj, x, y) {
            var position = {x: x, y: y};
            return new ClassFactory[obj.type](obj.name, position, obj.action || null, obj.variables || null);
        }

        isPassable (position) {
            if (!this.onMap(position.x,position.y)) return false;

            var passable = this.mapArray[position.x][position.y].every((obj)=>obj.passable);
            return passable;
        }

        onMap (x,y) {
                if(x < 0 || y < 0 || x >= this.mapArray.length || y >= this.mapArray[0].length) return false;
                return true;
            }


   }
    return Map;
});
