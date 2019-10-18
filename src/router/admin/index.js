module.exports = {
    BuildingManager: {
        path: "/manage/building/buildingmanage",
        layout: "admin",
        component: () => import(/* webpackChunkName: "itemmanager" */"@p/Modules/BuildingManage")
    },
    LabManager: {
        path: "/manage/building/labmanage",
        layout: "admin",
        component: () => import(/* webpackChunkName: "itemmanager" */"@p/Modules/LabManage")
    }
};
