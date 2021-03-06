var tileSize = 31.5;

var mesh = null;
var rows = 2;
var cols = 2;
var mouseHovering = false;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var zoomFactor = 70;

var keepRotating = true;

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth - 320, window.innerHeight );
document.body.appendChild( renderer.domElement );
renderer.domElement.id = "mainCanvas";
document.getElementById("mainCanvas").addEventListener("mouseover", (e) => {
    mouseHovering = true;
})
document.getElementById("controls").addEventListener("mouseover", (e) => {
    if( mouseHovering ) {
        camera.position.set( 0, -75, zoomFactor );
    }
    mouseHovering = false;
})

// Base
var origin = new THREE.Vector3( 0, 0, 0 );
var bases = [];
var tiles = [];

function changeClickedTile( raycaster ) {
    let intersects = raycaster.intersectObjects( tiles, true );
    if (intersects.length > 0) {
        let selectedObject = intersects[0];
        if( tileType >= 0 ) {
            selectedObject.object.geometry = tileGeometries[tileType];
        }
        else if( tileType === -1 ) {
            scene.remove( selectedObject.object );
        }
    }
    intersects = raycaster.intersectObjects( bases, true );
    if( intersects.length > 0  &&  tileType === -1 ) {
        let selectedObject = intersects[0];
        scene.remove( selectedObject.object );
    }
}

function changeClickedSceneElement( raycaster ) {
    let intersects = raycaster.intersectObjects( walls, true );
    if( intersects.length > 0 ) {
        intersects[0].object.geometry = wallGeometries[wallStyle];
    }
    else {
        changeClickedTile( raycaster );
    }
}

document.getElementById("mainCanvas").addEventListener('click', function(event) {
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();
    mouse.x = ( event.clientX / document.getElementById("mainCanvas").clientWidth ) * 2 - 1;
    mouse.y = 0 - ( event.clientY / document.getElementById("mainCanvas").clientHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    changeClickedSceneElement( raycaster );
}, false)

// Lights
var light1 = new THREE.DirectionalLight( 0xffffff, 1 );
light1.position.set( 5, 5, 5 );
scene.add( light1 );
var light2 = new THREE.DirectionalLight( 0xffffff, 1 );
light2.position.set( -2, -2, 5 );
scene.add( light2 );

// Position camera
camera.position.z = 70;
camera.position.y = -70;
camera.position.set( 0, -75, zoomFactor );

var clock = new THREE.Clock();
var matrix = new THREE.Matrix4();

// Terrain feature
var feature = null;
var loader = new THREE.STLLoader();

// Setup walls
var walls = [];
var wallFlags = [];
for( let i = 0; i < 4; i++ ) {
    wallFlags[i] = false;
}
var northWall = false;
var southWall = false;
var eastWall = false;
var westWall = false;
var wallStyle = 0;
var wallGeometries = [null,null,null,null,null,null];
loader.load( './stl/Low_wall.stl', function ( wallGeometry ) {
    wallGeometries[0] = wallGeometry;
});
loader.load( './stl/Stone_wall.stl', function ( wallGeometry ) {
    wallGeometries[1] = wallGeometry;
});
loader.load( './stl/Cinderblock.stl', function ( wallGeometry ) {
    wallGeometries[2] = wallGeometry;
});
loader.load( './stl/Boulders.stl', function ( wallGeometry ) {
    wallGeometries[3] = wallGeometry;
});
loader.load( './stl/High_wall.stl', function ( wallGeometry ) {
    wallGeometries[4] = wallGeometry;
});
loader.load( './stl/Archway.stl', function ( wallGeometry ) {
    wallGeometries[5] = wallGeometry;
});

// Tiles
var tileMaterial = new THREE.MeshLambertMaterial( { color: 0xaaaaaa } );
var tileType = 0;
var tileGeometries = [null, null, null, null];
tileGeometries[0] = new THREE.BoxGeometry( tileSize * 0.95, tileSize * 0.95, tileSize * 0.025 );
tileGeometries[0].scale( 0.95, 0.95, 0.95 );
loader.load( './stl/Field_tile.stl', function ( tileGeometry ) {
    tileGeometries[1] = tileGeometry;
    tileGeometries[1].translate( 0, -2, 0 );
    tileGeometries[1].scale( 0.95, 0.95, 0.95 );
});
loader.load( './stl/Cobblestone.stl', function ( tileGeometry ) {
    tileGeometries[2] = tileGeometry;
    tileGeometries[2].translate( 0, -2, 0 );
    tileGeometries[2].scale( 0.95, 0.95, 0.95 );
});
loader.load( './stl/Rubble.stl', function ( tileGeometry ) {
    tileGeometries[3] = tileGeometry;
    tileGeometries[3].scale( 0.95, 0.95, 0.95 );
});

function toggleWallById( id, inID, wallFlag ) {
    if( id === inID ) {
        wallFlag = wallFlag ? false : true;
        document.getElementById(id).style.backgroundColor = (wallFlag) ? 'black' : 'white';
    }
    return wallFlag;
}

function toggleWall( wallId ) {
    northWall = toggleWallById( wallId, "northWall", northWall );
    southWall = toggleWallById( wallId, "southWall", southWall );
    eastWall = toggleWallById( wallId, "eastWall", eastWall );
    westWall = toggleWallById( wallId, "westWall", westWall );
    updateScreenControls();
}

function animate() {
    requestAnimationFrame( animate );
    let axis = new THREE.Vector3( 0, 0, 1 );
    let quaternion = new THREE.Quaternion;
    if( mouseHovering ) {
        camera.position.x = 0;
        camera.position.y = 0;
        camera.up = new THREE.Vector3( 0, 1, 1 );
    }
    else if( keepRotating ) {
        camera.position.applyQuaternion(quaternion.setFromAxisAngle(axis, 0.01));
        camera.up.applyQuaternion(quaternion.setFromAxisAngle(axis, 0.01));
    }
    camera.lookAt( origin );
    renderer.render( scene, camera );
}

function updateScreenControls() {
    // Remove all existing bases
    for( let base of bases ) {
        scene.remove( base );
    }
    bases = [];
    // Remove all existing tiles
    for( let tile of tiles ) {
        scene.remove( tile );
    }
    tiles = [];

    // Generate tiles
    const halfTileSize = tileSize * 0.5;
    const rowOffset = halfTileSize * rows - halfTileSize;
    const colOffset = halfTileSize * cols - halfTileSize;
    for( let row = 0; row < rows; row++ ) {
        for( let col = 0; col < cols; col++ ) {
            // Add base
            const baseGeometry = new THREE.BoxGeometry( tileSize, tileSize, tileSize * 0.025 );
            baseGeometry.computeFaceNormals();
            baseGeometry.computeVertexNormals();
            let base = new THREE.Mesh( baseGeometry, tileMaterial );
            base.position.z = 0;
            base.position.x = row * tileSize - rowOffset;
            base.position.y = col * tileSize - colOffset;
            scene.add( base );
            bases.push( base );
            // Add tile
            let tileGeometry = null;
            let tile = null;
            tileGeometry = tileGeometries[0];
            tileGeometry.translate( 0, 0, 0 );
            tileGeometry.computeBoundingBox();
            tile = new THREE.Mesh( tileGeometry, tileMaterial );
            tile.position.z = tileSize * 0.025;
            tile.position.x = row * tileSize - rowOffset;
            tile.position.y = col * tileSize - colOffset;
            scene.add( tile );
            tiles.push( tile );
        }
    }
    // Generate walls
    for( let wall of walls ) {
        scene.remove( wall );
    }
    walls = [];
    const wallZmod = 0.25;
    const wallLateralMod = 0.085;
    let material = new THREE.MeshLambertMaterial( { color: 0xffffff } );
    if( northWall ) {
        for( let row = 0; row < rows; row++ ) {
            let wall = new THREE.Mesh( wallGeometries[0], material );
            wall.rotation.z = 1.570796;
            wall.position.z = tileSize * wallZmod - 1.5;
            //if( wallStyle === 1 ) { wall.position.z += 13.5 };
            wall.position.x = row * tileSize - rowOffset;
            wall.position.y = tileSize * cols * 0.5 - (tileSize * wallLateralMod);
            scene.add( wall );
            walls.push( wall );
        }
    }
    if( southWall ) {
        for( let row = 0; row < rows; row++ ) {
            let wall = new THREE.Mesh( wallGeometries[0], material );
            wall.rotation.z = 1.570796;
            wall.position.x = row * tileSize - rowOffset;
            wall.position.z = tileSize * wallZmod - 1.5;
            //if( wallStyle === 1 ) { wall.position.z += 13.5 };
            wall.position.y = 0 - tileSize * cols * 0.5 + (tileSize * wallLateralMod);
            scene.add( wall );
            walls.push( wall );
        }
    }
    if( eastWall ) {
        for( let col = 0; col < cols; col++ ) {
            let wall = new THREE.Mesh( wallGeometries[0], material );
            wall.position.y = col * tileSize - colOffset;
            wall.position.z = tileSize * wallZmod - 1.5;
            //if( wallStyle === 1 ) { wall.position.z += 13.5 };
            wall.position.x = tileSize * rows * 0.5 - (tileSize * wallLateralMod);
            scene.add( wall );
            walls.push( wall );
        }
    }
    if( westWall ) {
        for( let col = 0; col < cols; col++ ) {
            let wall = new THREE.Mesh( wallGeometries[0], material );
            wall.position.y = col * tileSize - colOffset;
            wall.position.z = tileSize * wallZmod - 1.5;
            //if( wallStyle === 1 ) { wall.position.z += 13.5 };
            wall.position.x = 0 - tileSize * rows * 0.5 + (tileSize * wallLateralMod);
            scene.add( wall );
            walls.push( wall );
        }
    }
    // Move camera based on size of base
    zoomFactor = ((rows < cols) ? cols : rows) * 35;
    camera.position.z = zoomFactor;
}

function setRows() {
    rows = document.getElementById('rows').value;
    updateScreenControls();
}

function setCols() {
    cols = document.getElementById('cols').value;
    updateScreenControls();
}

function saveSTL() {
    var exporter = new THREE.STLExporter();
    var stlString = exporter.parse( scene );
    var blob = new Blob([stlString], {type: 'text/plain'});
    saveAs( blob, 'tiles-' + rows + 'x' + cols + '.stl' );
}

function reset() {
    document.getElementById("feature")[0].selected = true;
    elems = document.querySelectorAll('select');
    instances = M.FormSelect.init(elems);
    changeFeature();
    updateScreenControls();
}

function changeTileStyle( newStyle ) {
    if( newStyle < -1  ||  newStyle > 3 ) {
        return;
    }
    tileType = newStyle;
}

function changeWallHeight( newStyle ) {
    if( newStyle < 0  ||  newStyle > 5 ) {
        return;
    }
    wallStyle = newStyle;
}

// Create feature in center of tile
function changeFeature() {
    if( feature !== null ) {
        scene.remove( feature );
        delete feature;
    }
    const features = [ 'none', 'Fountain', 'Pool' ];
    const i = parseInt(document.getElementById("feature").selectedIndex);
    if( i < 1  ||  i >= features.length ) {
        return;
    }
    document.getElementById("spinner").style.display = "block";
    loader.load( './stl/' + features[i] + '.stl', function ( geometry ) {
        feature = new THREE.Mesh( geometry, tileMaterial );
        feature.position.z = tileSize * 0.15;
        scene.add( feature );
        document.getElementById("spinner").style.display = "none";
    });
}

// Pause or continue the rotation of the 3D tile
function changeRotation( keepRotating ) {
    if( keepRotating ) {
        document.getElementById('rotationBtn').innerHTML = "Start rotation";
        return false;
    }
    else {
        document.getElementById('rotationBtn').innerHTML = "Pause rotation";
        return true;
    }
}

updateScreenControls();
animate();

// Enable various features in Materialize
document.addEventListener('DOMContentLoaded', function() {
    var modalInstances = M.Modal.init(document.querySelectorAll('.modal'));
    var tabInstances = M.Tabs.init(document.querySelectorAll('.tabs'));
    var selectInstances = M.FormSelect.init( document.querySelectorAll('select'));
});