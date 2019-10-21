module.exports = {
    BuildingManager: {
        path: "/manage/building/buildingmanager",
        layout: "admin",
        component: () => import(/* webpackChunkName: "itemmanager" */"@p/Modules/BuildingManager")
    },
    LabManager: {
        path: "/manage/building/labmanager",
        layout: "admin",
        component: () => import(/* webpackChunkName: "itemmanager" */"@p/Modules/LabManager")
    }
};
