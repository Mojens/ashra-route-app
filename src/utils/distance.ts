import {
    PointOfInterest,
    RouteCoordinate,
} from "../types/route";

export function calculateDistanceMeters(
    first: RouteCoordinate,
    second: RouteCoordinate,
): number {
    const earthRadiusMeters = 6371000;

    const latitudeDifference = toRadians(
        second.latitude - first.latitude,
    );

    const longitudeDifference = toRadians(
        second.longitude - first.longitude,
    );

    const firstLatitude = toRadians(first.latitude);
    const secondLatitude = toRadians(second.latitude);

    const a =
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(firstLatitude) *
        Math.cos(secondLatitude) *
        Math.sin(longitudeDifference / 2) ** 2;

    const c =
        2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusMeters * c;
}

function toRadians(value: number): number {
    return (value * Math.PI) / 180;
}

export function findNearestPointOfInterest(
    origin: RouteCoordinate,
    places: PointOfInterest[],
): PointOfInterest | null {
    if (places.length === 0) {
        return null;
    }

    return places.reduce((nearest, current) => {
        const nearestDistance = calculateDistanceMeters(
            origin,
            nearest.coordinate,
        );

        const currentDistance = calculateDistanceMeters(
            origin,
            current.coordinate,
        );

        return currentDistance < nearestDistance
            ? current
            : nearest;
    });
}

export function calculateDistanceToRouteMeters(
    position: RouteCoordinate,
    routeCoordinates: RouteCoordinate[],
): number | null {
    if (routeCoordinates.length === 0) {
        return null;
    }

    let shortestDistance = Infinity;

    for (const routeCoordinate of routeCoordinates) {
        const distance = calculateDistanceMeters(
            position,
            routeCoordinate,
        );

        if (distance < shortestDistance) {
            shortestDistance = distance;
        }
    }

    return shortestDistance;
}