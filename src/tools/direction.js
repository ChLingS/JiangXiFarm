class Direction{
    __init(){
        this.scene = this.scene
        this.lng1 = this.lng1
        this.lat1 = this.lat1
        this.lng2 = this.lng2
        this.lat2 = this.lat2
    }
    //两点间行进距离
    getDistance(){
        async ()=>{
            const res = await axios.get('http://127.0.0.1:5000/path?olng='+this.lng1+'&olat='+this.lat1+'&elng='+this.lng2+'&elat='+this.lat2)
            return res
        }
        console.log(res);
    }
}