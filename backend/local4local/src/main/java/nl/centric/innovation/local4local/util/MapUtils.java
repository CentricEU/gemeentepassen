package nl.centric.innovation.local4local.util;

import nl.centric.innovation.local4local.dto.LatLonDto;
import nl.centric.innovation.local4local.entity.SupplierProfile;
import nl.centric.innovation.local4local.exceptions.L4LException;
import nl.centric.innovation.local4local.infrastructure.OperationResult;
import nl.centric.innovation.local4local.util.locations.SridConstants;
import org.geotools.geometry.DirectPosition2D;
import org.geotools.geometry.jts.JTSFactoryFinder;
import org.geotools.referencing.CRS;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.crs.CoordinateReferenceSystem;


public class MapUtils {
    public static Point getPointFromGeographicCoordinates(double longitude, double latitude) throws L4LException {
        GeometryFactory gf = JTSFactoryFinder.getGeometryFactory();
        Point point;
        try {
            CoordinateReferenceSystem globalCRS = CRS.parseWKT(SridConstants.WKT4326);
            DirectPosition2D directPosition2D = new DirectPosition2D(globalCRS, longitude, latitude);

            Coordinate coordinate = new Coordinate(directPosition2D.getCoordinate()[0], directPosition2D.getCoordinate()[1]);

            point = gf.createPoint(coordinate);
            point.setSRID(SridConstants.srid4326);

        } catch (FactoryException e) {
            throw new L4LException("Couldn't create coordinates!");
        }
        return point;
    }

    public static OperationResult setCoordonates(SupplierProfile profile, LatLonDto coordinates) throws L4LException {
        Point settingLocation = MapUtils.getPointFromGeographicCoordinates(coordinates.getLongitude(), coordinates.getLatitude());
        profile.setCoordinates(settingLocation);

        return OperationResult.SuccessResult();
    }
}
