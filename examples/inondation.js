function adjustAltitude(value) {
      var THREE = itowns.THREE;
      /*var meshCoord = new itowns.Coordinates('EPSG:4978', globeView.mesh.position).as('EPSG:4326')
      meshCoord.setAltitude(value+165);
      globeView.mesh.position.copy(meshCoord.as(globeView.referenceCrs).xyz());*/
      //globeView.mesh.getAttribute('position');
      modify_level(globeView.mesh.geometry.getAttribute('position'), value);
      globeView.mesh.geometry.attributes.position.needsUpdate = true;
      globeView.mesh.updateMatrixWorld();
  }
