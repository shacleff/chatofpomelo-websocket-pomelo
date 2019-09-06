var room_mgr = {
    room_map: {},
    
    /**
     * 功能:添加一个房间
     */
    add_room: function (rid, room) {
        if (!this.room_map[rid]) {
            this.room_map[rid] = room;
        } else {
            console.log("rid=", rid, "的房间已经存在!!!");
        }
    },

    /**
     * 功能:根据房间id查找房间
     */
    is_exist_room_by_rid: function (rid) {
        if (this.room_map[rid]) {
            return true;
        }
        return false;
    },
    
    get_room_by_rid: function (rid) {
        return this.room_map[rid];
    }
}

module.exports = room_mgr;