app.factory('MapObjectFactory', function(PosFactory, TilesizeFactory){

    class MapObject {
      constructor(name, position, action, variables){
        //name matches scope variable from spells tools
        this.name = name;
        this.position = new PosFactory(position.x, position.y);
        this.action = action || null;
        this.variables = variables || null;
        this.passable = true;
        this.entity = this.basicEntity(name);
      }

      basicEntity(sprite) {
        var e = Crafty.e('2D, Tween, Canvas, ' + sprite);
        e._attr({w: TilesizeFactory.TILESIZE, h: TilesizeFactory.TILESIZE, rotation: 0});
        e.origin('top left');

        return e;
      }

      setMap(mappy){
        this.map = mappy;
      }

      setMapPos(position) {
        var pos = new PosFactory(position.x, position.y);
        //this.map.removeObject(this);
        this.map.addObject(this, pos);
        this.position = pos;
        this.entity.x = pos.x * TilesizeFactory.TILESIZE;
        this.entity.y = pos.y * TilesizeFactory.TILESIZE;

      }

      move(dir, amt) {
        var newPos = new PosFactory(this.position.x, this.position.y);
        newPos.addDir(dir, amt);

        if(this.map.isPassable(newPos)){
          return newPos;
        }else{
          return false;
        }

      }

      getMapPos(){
        return this.position;
      }

      tween(attrs, duration, callback){
        this.entity.requires('Tween');
        this.entity.tween(attrs,duration);
        // Set up callback to run once at end of tweening...
        if (callback) {
          var self = this;
          var onceFn = function() {
            self.entity.unbind('TweenEnd', onceFn);
            setTimeout(function() {callback.call(self)}, 50);
          };
          this.entity.bind('TweenEnd', onceFn);
        }
      }

      promTweenQueen(attrs, duration){
        console.log('I\'m a prom tween queen')
        var self = this;
        return new Promise(function(resolve, reject){
          self.tween(attrs, duration, function(err, res){
            if(err) reject(err);
            else resolve(res);
          });
        });
      }

      onCycle(){
        //go through all the actions on the object
        if(this.action){
          this.action.forEach(action => {
            this[action]();
          });
        }
      }

    }

    return MapObject;


});
