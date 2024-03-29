/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
import * as THREE from 'three';
import TileMesh from 'Core/TileMesh';
import LayeredMaterial from 'Renderer/LayeredMaterial';
import newTileGeometry from 'Core/Prefab/TileBuilder';

const dimensions = new THREE.Vector2();

function setTileFromTiledLayer(tile, tileLayer) {
    tile.material.transparent = tileLayer.opacity < 1.0;
    tile.material.opacity = tileLayer.opacity;

    if (tileLayer.diffuse) {
        tile.material.diffuse = tileLayer.diffuse;
    }

    if (__DEBUG__) {
        tile.material.showOutline = tileLayer.showOutline || false;
        tile.material.wireframe = tileLayer.wireframe || false;
    }

    if (tileLayer.isGlobeLayer) {
        // Computes a point used for horizon culling.
        // If the point is below the horizon,
        // the tile is guaranteed to be below the horizon as well.
        tile.horizonCullingPoint = tile.extent.center().as('EPSG:4978').toVector3();
        tile.extent.dimensions(dimensions).multiplyScalar(THREE.Math.DEG2RAD);

        // alpha is maximum angle between two points of tile
        const alpha = dimensions.length();
        const h = Math.abs(1.0 / Math.cos(alpha * 0.5));
        tile.horizonCullingPoint.setLength(h * tile.horizonCullingPoint.length());
        tile.horizonCullingPointElevationScaled = tile.horizonCullingPoint.clone();
    }
}

export default {
    convert(requester, extent, layer) {
        const parent = requester;
        const level = (parent !== undefined) ? (parent.level + 1) : 0;

        const paramsGeometry = {
            extent,
            level,
            segment: layer.options.segments || 16,
            disableSkirt: layer.disableSkirt,
        };

        return newTileGeometry(paramsGeometry).then((geometry) => {
            // build tile mesh
            geometry._count++;
            const crsCount = layer.tileMatrixSets.length;
            const material = new LayeredMaterial(layer.materialOptions, crsCount);
            const tile = new TileMesh(geometry, material, layer, extent, level);

            // Commented because layer.threejsLayer is undefined;
            // Fix me: conflict with object3d added in view.scene;
            // tile.layers.set(layer.threejsLayer);


            tile.visible = false;
            tile.updateMatrix();

            tile.add(tile.obb);

            setTileFromTiledLayer(tile, layer);

            if (parent) {
                tile.setBBoxZ(parent.obb.z.min, parent.obb.z.max);
            }

            return tile;
        });
    },
};
