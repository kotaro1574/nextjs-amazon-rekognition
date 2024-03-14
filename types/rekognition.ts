export interface IndexFacesResponse {
  FaceModelVersion: string
  FaceRecords: FaceRecord[]
  OrientationCorrection?: string
  UnindexedFaces: UnindexedFace[]
}

interface FaceRecord {
  Face: Face
  FaceDetail: FaceDetail
}

interface Face {
  BoundingBox: BoundingBox
  Confidence: number
  ExternalImageId: string
  FaceId: string
  ImageId: string
}

interface FaceDetail {
  BoundingBox: BoundingBox
  Confidence: number
  Landmarks: Landmark[]
  Pose: Pose
  Quality: Quality
}

interface BoundingBox {
  Height: number
  Left: number
  Top: number
  Width: number
}

interface Landmark {
  Type: string
  X: number
  Y: number
}

interface Pose {
  Pitch: number
  Roll: number
  Yaw: number
}

interface Quality {
  Brightness: number
  Sharpness: number
}

interface UnindexedFace {
  FaceDetail: FaceDetail
  Reasons: string[]
}
