exports.style = {
	common : {
		loadingMsg : '読み込み中...',
		offlineMsg : 'ネットワークに接続できません。\n接続後に再度お試しください。',
		loadingFailMsg : '読み込みに失敗しました',
		noDataMsg : '該当データが見つかりませんでした',
		noMovieMsg : '動画が見つかりませんでした',
		mainTextColor : 'white',
		rowBgSelectedColor : "#f66",
		indicator : {
			font: {
				fontSize : 17,
				fontWeight : 'bold'
			},
			color: 'white',
			message: '読み込み中...'			
		},
        titleBar : {
            width: Ti.UI.FILL,
            height: 30,
            backgroundColor: 'red',
            color: 'white',
            top: 0          
        }
	},
	news : {
	    table : {
	        backgroundColor: 'black',
	        backgroundSelectedColor : "red",
            separatorColor: '#666',
            top : 40
	    },
		tableViewRow : {
			height : Ti.UI.SIZE,
			hasDetail : true,
			type: 'CONTENT'
		},
		titleLabel : {
			color : "white",
			font : {fontSize : 16},
			width : Ti.UI.FILL,
			height : Ti.UI.SIZE,
			top : 4,
			/*bottom: 0,*/
			left : 0,
			right : 4
		},
        imgView : {
            width: 80,
            top : 10,
            bottom : 10,
            left : 4
        },
		siteNameLabel : {
			color : "lightgray",
			font : {fontSize : 14},
			width : Ti.UI.FILL,
			height : Ti.UI.SIZE,
			bottom : 10,
            left : 0,
			right : 4,
			textAlign : 'right'
		},
		loadMoreLabel : {
			color : 'white',
			font : {fontSize : 16},
			top : 25,
			left : 100			
		},
		loadMoreRow : {
			layout : 'horizontal',
			width : Ti.UI.FILL,
			height : Ti.UI.SIZE,
			backgroundSelectedColor: "#f66",
			type: 'LOAD_MORE'
		},
		loadMoreImg : {
			image : "/images/heart40.png",
			width: 40,
			height: 33,
			top : 24,
			left : 65
		},
		tableHeader : {
            backgroundColor: "black",
            width:320,
            height:60    
		},
		arrow : {
            backgroundImage:"/images/whiteArrow.png",
            width:23,
            height:60,
            bottom:10,
            left:20		    
		},
		statusLabel : {
            text:"ひっぱって更新",
            left:55,
            width:200,
            bottom:30,
            height: Ti.UI.FILL,
            color: "dddddd",
            textAlign:"center",
            font:{fontSize:13,fontWeight:"bold"}
		},
		tableBorder : {
            backgroundColor:"#576c89",
            height:2,
            bottom:0
		},
		lastUpdatedLabel : {
            left: 55,
            width:200,
            bottom:15,
            height:"auto",
            color:"#dddddd",
            textAlign:"center",
            font:{fontSize:12}
		},
		refreshActIndicator : {
            left:20,
            bottom:13,
            width:30,
            height:30
		},
		visitedBgColor : '#457'
	},
	results : {
	    table : {
	        backgroundColor: 'black',
	        separatorColor: 'gray'
	    },
		tableViewRow : {
			height : 'auto',
			backgroundColor : 'black',
//			backgroundSelectedColor : "#f66",
			className : 'resultsTableRow',
			type: 'CONTENT'
		},
		dateLabel : {
			width : 135,
			color : 'lightgray',
			font : {fontSize : 13},
			height : 24,
			top : 4,
			left : 4			
		},
		compeLabel : {
			color : 'lightgray',
			font : {fontSize : 13},
			width : 140,
			height : 24,
			top : 4,
			left : 155			
		},
		stadiumLabel : {
			width : 200,
			color : 'lightgray',
			font : {fontSize : 13},
			top : 26,
			left : 5			
		},
		teamLabel : {
			width : 210,
			color : 'white',
			font : {fontSize : 19},
			top : 51,
			// bottom : 10,
			left : 5			
		},
		resultLabel : {
			width : 32,
			height : 32,
			top : 46,
			right : 60			
		},
		scoreLabel : {
			color : 'white',
			font : {fontSize : 25},
			height : "auto",
			top : 48,
			// bottom : 10,
			right : 10			
		},
		detailButton : {
			backgroundImage : '/images/gameDetailBtn.png',
			backgroundSelectedImage : '/images/gameDetailSelectedBtn.png',
			color : 'white',
			font : {fontSize : 17},
			width : 84,
			height : 37,
			top : 90,
			bottom : 8,
			right : 112 //元々90			
		},
		movieButton : {
			backgroundImage : '/images/movieSearchBtn.png',
			backgroundSelectedImage : '/images/movieSearchSelectedBtn.png',
			color : 'white',
			font : {fontSize : 17},
			width : 84,
			height : 37,
			top : 90,
			bottom : 8,
			right : 10			
		}
	},
	standings : {
	    table : {
            top: 37,
            allowsSelection: false,
            separatorColor: '#666'	        
	    },
	    headerView : {
	        backgroundColor: 'black'
	    },
	    headerLabel : {
            height: 33,
            top : 1,
            backgroundColor: 'black',
            color: 'white'	        
	    },
	    border : {
            width: Ti.UI.FILL,
            height: 1,
            top: 34
            ,borderWidth: 1
            ,borderColor: '#999'	        
	    },
	    tableViewRow : {
            height: 28
            ,color: 'white'
            ,backgroundColor: 'black'	        
	    }
	},
	twitter : {
	    window : {
            title: L('twitter')
            ,backgroundColor: 'black'
            ,barColor: 'red'
	    },
	    table : {
	        separatorColor: '#666',
	        allowsSelection: true,
	        top : 40
	    },
		tableViewRow : {
			height : Ti.UI.SIZE,
			backgroundColor : "black",
			backgroundSelectedColor : "red",
			type: 'CONTENT'			
		},
		profileImg : {
			backgroundColor: 'white',
			width: 48,
			height: 48,
			top : 10,
			left : 2			
		},
		userNameLabel : {
			color : 'white',
			font : {
				fontSize : 15,
				fontWeight: 'bold'
			},
			height : 17,
            width : Ti.UI.FILL,
			top : 5,
			left : 58			
		},
		textLabel : {
			color : 'white',
			font : {fontSize : 15},
			height : Ti.UI.SIZE,
            width : Ti.UI.FILL,
			top : 28,
			left : 70,
			bottom : 24
		},
		timeLabel : {
		    /*color : "#d87",*/
		   color : "lightgray",
            font : {fontSize : 13},
            height : Ti.UI.SIZE,
            bottom : 5,
            left : 70
		},
		loadingRow : {
		    color: 'white'
		    ,backgroundColor : 'black'
            ,width: Ti.UI.FILL
            ,height: 50
		},
        loadingIndicator : {
            color: 'white'
            ,backgroundColor : 'black'
            ,width: Ti.UI.FILL
            ,height: 50
        },
        tableHeader : {
            backgroundColor: "black",
            width:320,
            height:60    
        },
        arrow : {
            backgroundImage:"/images/whiteArrow.png",
            width:23,
            height:60,
            bottom:10,
            left:20         
        },
        statusLabel : {
            text:"ひっぱって更新",
            left:55,
            width:200,
            bottom:30,
            height: Ti.UI.FILL,
            color: "dddddd",
            textAlign:"center",
            font:{fontSize:13,fontWeight:"bold"}
        },
        tableBorder : {
            backgroundColor:"#576c89",
            height:2,
            bottom:0
        },
        lastUpdatedLabel : {
            left: 55,
            width:200,
            bottom:15,
            height:"auto",
            color:"#dddddd",
            textAlign:"center",
            font:{fontSize:12}
        },
        refreshActIndicator : {
            left:20,
            bottom:13,
            width:30,
            height:30
        }
	}
}