/**
 * Created by Austin on 10/2/15.
 */
//jsData
app.factory('StoryFactory', (DS, $http) => {
    return DS.defineResource({
        name: 'stories',
        idAttribute: '_id',
        relations: {
            hasOne: {
                users: {
                    localKey: 'userId',
                    localField: 'author'
                }
            }
        }
    })
}).run(function(StoryFactory) {});
Code-Commander
