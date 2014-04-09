Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
        Ext.create('Rally.data.WsapiDataStore', {
            model: 'UserStory',
            fetch: ['FormattedID','Name','PlanEstimate','Owner','Defects'],
            pageSize: 100,
            autoLoad: true,
            listeners: {
                load: this._onDataLoaded,
                scope: this
            }
        });
    },
    
    _createGrid: function(stories) {
        console.log('stories', stories);
         this.add({
            xtype: 'rallygrid',
            store: Ext.create('Rally.data.custom.Store', {
                data: stories,
                pageSize: 100
            }),
            
            columnCfgs: [
                {
                   text: 'Formatted ID', dataIndex: 'FormattedID', xtype: 'templatecolumn',
                    tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')
                },
                {
                    text: 'Name', dataIndex: 'Name'
                },
                {
                    text: 'PlanEstimate', dataIndex: 'PlanEstimate'
                },
                {
                    text: 'Owner', dataIndex: 'Owner'
                },
                {
                    text: 'Defect Count', dataIndex: 'DefectCount'
                },
                {
                    text: 'Defects', dataIndex: 'Defects', 
                    renderer: function(value) {
                        var html = [];
                        Ext.Array.each(value, function(defect){
                            html.push('<a href="' + Rally.nav.Manager.getDetailUrl(defect) + '">' + defect.FormattedID + '</a>')
                        });
                        return html.join(', ');
                    }
                }
            ]
            
        });
    },
    _onDataLoaded: function(store, data){
        
                var stories = [];
                var pendingDefects = data.length;
                
                _.each(data, function(story) {
                    var owner = story.get('Owner');
                    var s  = {
                        FormattedID: story.get('FormattedID'),
                        Name: story.get('Name'),
                        PlanEstimate: story.get('PlanEstimate'),
                        _ref: story.get("_ref"),
                        Owner: (owner && owner._refObjectName) || 'None',
                        DefectCount: story.get('Defects').Count,
                        Defects: []
                    };
                            
                    var defects = story.getCollection('Defects');
                    defects.load({
                        fetch: ['FormattedID'],
                        callback: function(records, operation, success){
                            Ext.Array.each(records, function(defect){
                                s.Defects.push({_ref: defect.get('_ref'),
                                                FormattedID: defect.get('FormattedID')
                                            });
                            }, this);
                            
                            --pendingDefects;
                            if (pendingDefects === 0) {
                                this._createGrid(stories);
                            }
                        },
                        scope: this
                    });
                    stories.push(s);
                            
                }, this);
                
    }             
});
