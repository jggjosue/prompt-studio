import{Matrix3 as Fe,Vector2 as ft,Color as $e,Vector3 as Ie,mergeUniforms as mt,CubeUVReflectionMapping as sa,Mesh as Ct,BoxGeometry as Sa,ShaderMaterial as bt,BackSide as ht,cloneUniforms as Va,Matrix4 as Wt,ColorManagement as Qe,SRGBTransfer as ke,PlaneGeometry as Wa,FrontSide as Qt,getUnlitUniformColorSpace as pi,IntType as za,warn as Be,HalfFloatType as wt,UnsignedByteType as St,FloatType as It,RGBAFormat as Pt,Plane as mi,CubeReflectionMapping as Jt,CubeRefractionMapping as zt,BufferGeometry as la,OrthographicCamera as ka,PerspectiveCamera as ca,NoToneMapping as Tt,MeshBasicMaterial as hi,error as Xe,NoBlending as Dt,WebGLRenderTarget as Mt,BufferAttribute as da,LinearSRGBColorSpace as Xa,LinearFilter as _t,CubeTexture as Ya,LinearMipmapLinearFilter as kt,CubeCamera as _i,EquirectangularReflectionMapping as Ta,EquirectangularRefractionMapping as Ma,warnOnce as gi,Uint32BufferAttribute as vi,Uint16BufferAttribute as Ei,DataArrayTexture as qa,Vector4 as pt,DepthTexture as ea,Float32BufferAttribute as ja,RawShaderMaterial as Si,CustomToneMapping as Ka,NeutralToneMapping as Za,AgXToneMapping as $a,ACESFilmicToneMapping as Qa,CineonToneMapping as Ja,ReinhardToneMapping as er,LinearToneMapping as tr,Data3DTexture as Ti,GreaterEqualCompare as xa,LessEqualCompare as Aa,Texture as Mi,GLSL3 as ar,VSMShadowMap as ta,PCFShadowMap as ua,AddOperation as xi,MixOperation as Ai,MultiplyOperation as Ri,LinearTransfer as rr,UniformsUtils as Ci,DoubleSide as Ut,NormalBlending as fa,TangentSpaceNormalMap as ir,ObjectSpaceNormalMap as bi,Layers as Pi,RGFormat as Xt,RG11_EAC_Format as Ra,RED_GREEN_RGTC2_Format as Ca,MeshDepthMaterial as Di,MeshDistanceMaterial as Ui,PCFSoftShadowMap as Li,DepthFormat as Yt,NearestFilter as Ot,CubeDepthTexture as Ni,UnsignedIntType as Bt,Frustum as nr,LessEqualDepth as or,ReverseSubtractEquation as wi,SubtractEquation as Ii,AddEquation as aa,OneMinusConstantAlphaFactor as yi,ConstantAlphaFactor as Fi,OneMinusConstantColorFactor as Oi,ConstantColorFactor as Bi,OneMinusDstAlphaFactor as Gi,OneMinusDstColorFactor as Hi,OneMinusSrcAlphaFactor as Vi,OneMinusSrcColorFactor as Wi,DstAlphaFactor as zi,DstColorFactor as ki,SrcAlphaSaturateFactor as Xi,SrcAlphaFactor as Yi,SrcColorFactor as qi,OneFactor as ji,ZeroFactor as Ki,NotEqualDepth as Zi,GreaterDepth as $i,GreaterEqualDepth as Qi,EqualDepth as Ji,LessDepth as en,AlwaysDepth as tn,NeverDepth as an,CullFaceNone as rn,CullFaceBack as sr,CullFaceFront as nn,CustomBlending as on,MultiplyBlending as lr,SubtractiveBlending as cr,AdditiveBlending as dr,ReversedDepthFuncs as go,MinEquation as sn,MaxEquation as ln,MirroredRepeatWrapping as cn,ClampToEdgeWrapping as ba,RepeatWrapping as dn,LinearMipmapNearestFilter as Pa,NearestMipmapLinearFilter as pa,NearestMipmapNearestFilter as un,NotEqualCompare as fn,GreaterCompare as pn,EqualCompare as mn,LessCompare as hn,AlwaysCompare as _n,NeverCompare as gn,NoColorSpace as qt,DepthStencilFormat as jt,getByteLength as vn,UnsignedInt248Type as ra,UnsignedShortType as ma,createElementNS as vo,UnsignedShort4444Type as ur,UnsignedShort5551Type as fr,UnsignedInt5999Type as En,UnsignedInt101111Type as Sn,ByteType as Tn,ShortType as Mn,AlphaFormat as xn,RGBFormat as An,RedFormat as Rn,RedIntegerFormat as pr,RGIntegerFormat as mr,RGBAIntegerFormat as hr,RGB_S3TC_DXT1_Format as Da,RGBA_S3TC_DXT1_Format as Ua,RGBA_S3TC_DXT3_Format as La,RGBA_S3TC_DXT5_Format as Na,RGB_PVRTC_4BPPV1_Format as _r,RGB_PVRTC_2BPPV1_Format as gr,RGBA_PVRTC_4BPPV1_Format as vr,RGBA_PVRTC_2BPPV1_Format as Er,RGB_ETC1_Format as Sr,RGB_ETC2_Format as Tr,RGBA_ETC2_EAC_Format as Mr,R11_EAC_Format as xr,SIGNED_R11_EAC_Format as Ar,SIGNED_RG11_EAC_Format as Rr,RGBA_ASTC_4x4_Format as Cr,RGBA_ASTC_5x4_Format as br,RGBA_ASTC_5x5_Format as Pr,RGBA_ASTC_6x5_Format as Dr,RGBA_ASTC_6x6_Format as Ur,RGBA_ASTC_8x5_Format as Lr,RGBA_ASTC_8x6_Format as Nr,RGBA_ASTC_8x8_Format as wr,RGBA_ASTC_10x5_Format as Ir,RGBA_ASTC_10x6_Format as yr,RGBA_ASTC_10x8_Format as Fr,RGBA_ASTC_10x10_Format as Or,RGBA_ASTC_12x10_Format as Br,RGBA_ASTC_12x12_Format as Gr,RGBA_BPTC_Format as Hr,RGB_BPTC_SIGNED_Format as Vr,RGB_BPTC_UNSIGNED_Format as Wr,RED_RGTC1_Format as zr,SIGNED_RED_RGTC1_Format as kr,SIGNED_RED_GREEN_RGTC2_Format as Xr,ExternalTexture as Yr,EventDispatcher as Cn,ArrayCamera as bn,WebXRController as wa,RAD2DEG as Eo,DataTexture as Pn,createCanvasElement as Dn,SRGBColorSpace as Un,REVISION as Ln,log as qr,WebGLCoordinateSystem as jr,probeAsync as So}from"./three.core.js";export{AdditiveAnimationBlendMode,AlwaysStencilFunc,AmbientLight,AnimationAction,AnimationClip,AnimationLoader,AnimationMixer,AnimationObjectGroup,AnimationUtils,ArcCurve,ArrowHelper,AttachedBindMode,Audio,AudioAnalyser,AudioContext,AudioListener,AudioLoader,AxesHelper,BasicDepthPacking,BasicShadowMap,BatchedMesh,BezierInterpolant,Bone,BooleanKeyframeTrack,Box2,Box3,Box3Helper,BoxHelper,BufferGeometryLoader,Cache,Camera,CameraHelper,CanvasTexture,CapsuleGeometry,CatmullRomCurve3,CircleGeometry,Clock,ColorKeyframeTrack,Compatibility,CompressedArrayTexture,CompressedCubeTexture,CompressedTexture,CompressedTextureLoader,ConeGeometry,Controls,CubeTextureLoader,CubicBezierCurve,CubicBezierCurve3,CubicInterpolant,CullFaceFrontBack,Curve,CurvePath,CylinderGeometry,Cylindrical,DataTextureLoader,DataUtils,DecrementStencilOp,DecrementWrapStencilOp,DefaultLoadingManager,DetachedBindMode,DirectionalLight,DirectionalLightHelper,DiscreteInterpolant,DodecahedronGeometry,DynamicCopyUsage,DynamicDrawUsage,DynamicReadUsage,EdgesGeometry,EllipseCurve,EqualStencilFunc,Euler,ExtrudeGeometry,FileLoader,Float16BufferAttribute,Fog,FogExp2,FramebufferTexture,FrustumArray,GLBufferAttribute,GLSL1,GreaterEqualStencilFunc,GreaterStencilFunc,GridHelper,Group,HTMLTexture,HemisphereLight,HemisphereLightHelper,IcosahedronGeometry,ImageBitmapLoader,ImageLoader,ImageUtils,IncrementStencilOp,IncrementWrapStencilOp,InstancedBufferAttribute,InstancedBufferGeometry,InstancedInterleavedBuffer,InstancedMesh,Int16BufferAttribute,Int32BufferAttribute,Int8BufferAttribute,InterleavedBuffer,InterleavedBufferAttribute,Interpolant,InterpolateBezier,InterpolateDiscrete,InterpolateLinear,InterpolateSmooth,InterpolationSamplingMode,InterpolationSamplingType,InvertStencilOp,KeepStencilOp,KeyframeTrack,LOD,LatheGeometry,LessEqualStencilFunc,LessStencilFunc,Light,LightProbe,Line,Line3,LineBasicMaterial,LineCurve,LineCurve3,LineDashedMaterial,LineLoop,LineSegments,LinearInterpolant,LinearMipMapLinearFilter,LinearMipMapNearestFilter,Loader,LoaderUtils,LoadingManager,LoopOnce,LoopPingPong,LoopRepeat,MOUSE,Material,MaterialBlending,MaterialLoader,MathUtils,Matrix2,MeshLambertMaterial,MeshMatcapMaterial,MeshNormalMaterial,MeshPhongMaterial,MeshPhysicalMaterial,MeshStandardMaterial,MeshToonMaterial,NearestMipMapLinearFilter,NearestMipMapNearestFilter,NeverStencilFunc,NoNormalPacking,NormalAnimationBlendMode,NormalGAPacking,NormalRGPacking,NotEqualStencilFunc,NumberKeyframeTrack,Object3D,ObjectLoader,OctahedronGeometry,Path,PlaneHelper,PointLight,PointLightHelper,Points,PointsMaterial,PolarGridHelper,PolyhedronGeometry,PositionalAudio,PropertyBinding,PropertyMixer,QuadraticBezierCurve,QuadraticBezierCurve3,Quaternion,QuaternionKeyframeTrack,QuaternionLinearInterpolant,RGBADepthPacking,RGBDepthPacking,RGBIntegerFormat,RGDepthPacking,Ray,Raycaster,RectAreaLight,RenderTarget,RenderTarget3D,ReplaceStencilOp,RingGeometry,Scene,ShadowMaterial,Shape,ShapeGeometry,ShapePath,ShapeUtils,Skeleton,SkeletonHelper,SkinnedMesh,Source,Sphere,SphereGeometry,Spherical,SphericalHarmonics3,SplineCurve,SpotLight,SpotLightHelper,Sprite,SpriteMaterial,StaticCopyUsage,StaticDrawUsage,StaticReadUsage,StereoCamera,StreamCopyUsage,StreamDrawUsage,StreamReadUsage,StringKeyframeTrack,TOUCH,TetrahedronGeometry,TextureLoader,TextureUtils,Timer,TimestampQuery,TorusGeometry,TorusKnotGeometry,Triangle,TriangleFanDrawMode,TriangleStripDrawMode,TrianglesDrawMode,TubeGeometry,UVMapping,Uint8BufferAttribute,Uint8ClampedBufferAttribute,Uniform,UniformsGroup,VectorKeyframeTrack,VideoFrameTexture,VideoTexture,WebGL3DRenderTarget,WebGLArrayRenderTarget,WebGPUCoordinateSystem,WireframeGeometry,WrapAroundEnding,ZeroCurvatureEnding,ZeroSlopeEnding,ZeroStencilOp,getConsoleFunction,setConsoleFunction}from"./three.core.js";function Nn(){let e=null,a=!1,t=null,r=null;function l(n,f){t(n,f),r=e.requestAnimationFrame(l)}return{start:function(){a!==!0&&t!==null&&e!==null&&(r=e.requestAnimationFrame(l),a=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),a=!1},setAnimationLoop:function(n){t=n},setContext:function(n){e=n}}}function To(e){const a=new WeakMap;function t(m,N){const x=m.array,z=m.usage,F=x.byteLength,p=e.createBuffer();e.bindBuffer(N,p),e.bufferData(N,x,z),m.onUploadCallback();let T;if(x instanceof Float32Array)T=e.FLOAT;else if(typeof Float16Array<"u"&&x instanceof Float16Array)T=e.HALF_FLOAT;else if(x instanceof Uint16Array)m.isFloat16BufferAttribute?T=e.HALF_FLOAT:T=e.UNSIGNED_SHORT;else if(x instanceof Int16Array)T=e.SHORT;else if(x instanceof Uint32Array)T=e.UNSIGNED_INT;else if(x instanceof Int32Array)T=e.INT;else if(x instanceof Int8Array)T=e.BYTE;else if(x instanceof Uint8Array)T=e.UNSIGNED_BYTE;else if(x instanceof Uint8ClampedArray)T=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+x);return{buffer:p,type:T,bytesPerElement:x.BYTES_PER_ELEMENT,version:m.version,size:F}}function r(m,N,x){const z=N.array,F=N.updateRanges;if(e.bindBuffer(x,m),F.length===0)e.bufferSubData(x,0,z);else{F.sort((T,P)=>T.start-P.start);let p=0;for(let T=1;T<F.length;T++){const P=F[p],H=F[T];H.start<=P.start+P.count+1?P.count=Math.max(P.count,H.start+H.count-P.start):(++p,F[p]=H)}F.length=p+1;for(let T=0,P=F.length;T<P;T++){const H=F[T];e.bufferSubData(x,H.start*z.BYTES_PER_ELEMENT,z,H.start,H.count)}N.clearUpdateRanges()}N.onUploadCallback()}function l(m){return m.isInterleavedBufferAttribute&&(m=m.data),a.get(m)}function n(m){m.isInterleavedBufferAttribute&&(m=m.data);const N=a.get(m);N&&(e.deleteBuffer(N.buffer),a.delete(m))}function f(m,N){if(m.isInterleavedBufferAttribute&&(m=m.data),m.isGLBufferAttribute){const z=a.get(m);(!z||z.version<m.version)&&a.set(m,{buffer:m.buffer,type:m.type,bytesPerElement:m.elementSize,version:m.version});return}const x=a.get(m);if(x===void 0)a.set(m,t(m,N));else if(x.version<m.version){if(x.size!==m.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(x.buffer,m,N),x.version=m.version}}return{get:l,remove:n,update:f}}var Mo=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,xo=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Ao=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Ro=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Co=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,bo=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Po=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Do=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Uo=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Lo=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,No=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,wo=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Io=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,yo=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Fo=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Oo=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Bo=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Go=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Ho=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Vo=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Wo=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,zo=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,ko=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Xo=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Yo=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,qo=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,jo=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Ko=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Zo=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,$o=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Qo="gl_FragColor = linearToOutputTexel( gl_FragColor );",Jo=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,es=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,ts=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,as=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,rs=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,is=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,ns=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,os=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,ss=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,ls=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,cs=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,ds=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,us=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,fs=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,ps=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,ms=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,hs=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,_s=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,gs=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,vs=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Es=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Ss=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Ts=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = inverseTransformDirection( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Ms=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,xs=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,As=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Rs=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Cs=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,bs=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ps=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Ds=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Us=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ls=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Ns=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,ws=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Is=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,ys=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Fs=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Os=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Bs=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Gs=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Hs=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Vs=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Ws=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,zs=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ks=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Xs=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Ys=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,qs=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,js=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Ks=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Zs=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,$s=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Qs=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Js=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,el=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,tl=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,al=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,rl=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,il=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,nl=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,ol=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,sl=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,ll=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,cl=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,dl=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,ul=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,fl=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,pl=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,ml=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,hl=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,_l=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,gl=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,vl=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,El=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Sl=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Tl=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Ml=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,xl=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Al=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Rl=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Cl=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,bl=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Pl=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Dl=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Ul=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Ll=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Nl=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,wl=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Il=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,yl=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Fl=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Ol=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Bl=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Gl=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Hl=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Vl=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Wl=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,zl=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,kl=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Xl=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Yl=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,ql=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,jl=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Kl=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Zl=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,$l=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ql=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Jl=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ec=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,tc=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,be={alphahash_fragment:Mo,alphahash_pars_fragment:xo,alphamap_fragment:Ao,alphamap_pars_fragment:Ro,alphatest_fragment:Co,alphatest_pars_fragment:bo,aomap_fragment:Po,aomap_pars_fragment:Do,batching_pars_vertex:Uo,batching_vertex:Lo,begin_vertex:No,beginnormal_vertex:wo,bsdfs:Io,iridescence_fragment:yo,bumpmap_pars_fragment:Fo,clipping_planes_fragment:Oo,clipping_planes_pars_fragment:Bo,clipping_planes_pars_vertex:Go,clipping_planes_vertex:Ho,color_fragment:Vo,color_pars_fragment:Wo,color_pars_vertex:zo,color_vertex:ko,common:Xo,cube_uv_reflection_fragment:Yo,defaultnormal_vertex:qo,displacementmap_pars_vertex:jo,displacementmap_vertex:Ko,emissivemap_fragment:Zo,emissivemap_pars_fragment:$o,colorspace_fragment:Qo,colorspace_pars_fragment:Jo,envmap_fragment:es,envmap_common_pars_fragment:ts,envmap_pars_fragment:as,envmap_pars_vertex:rs,envmap_physical_pars_fragment:ms,envmap_vertex:is,fog_vertex:ns,fog_pars_vertex:os,fog_fragment:ss,fog_pars_fragment:ls,gradientmap_pars_fragment:cs,lightmap_pars_fragment:ds,lights_lambert_fragment:us,lights_lambert_pars_fragment:fs,lights_pars_begin:ps,lights_toon_fragment:hs,lights_toon_pars_fragment:_s,lights_phong_fragment:gs,lights_phong_pars_fragment:vs,lights_physical_fragment:Es,lights_physical_pars_fragment:Ss,lights_fragment_begin:Ts,lights_fragment_maps:Ms,lights_fragment_end:xs,lightprobes_pars_fragment:As,logdepthbuf_fragment:Rs,logdepthbuf_pars_fragment:Cs,logdepthbuf_pars_vertex:bs,logdepthbuf_vertex:Ps,map_fragment:Ds,map_pars_fragment:Us,map_particle_fragment:Ls,map_particle_pars_fragment:Ns,metalnessmap_fragment:ws,metalnessmap_pars_fragment:Is,morphinstance_vertex:ys,morphcolor_vertex:Fs,morphnormal_vertex:Os,morphtarget_pars_vertex:Bs,morphtarget_vertex:Gs,normal_fragment_begin:Hs,normal_fragment_maps:Vs,normal_pars_fragment:Ws,normal_pars_vertex:zs,normal_vertex:ks,normalmap_pars_fragment:Xs,clearcoat_normal_fragment_begin:Ys,clearcoat_normal_fragment_maps:qs,clearcoat_pars_fragment:js,iridescence_pars_fragment:Ks,opaque_fragment:Zs,packing:$s,premultiplied_alpha_fragment:Qs,project_vertex:Js,dithering_fragment:el,dithering_pars_fragment:tl,roughnessmap_fragment:al,roughnessmap_pars_fragment:rl,shadowmap_pars_fragment:il,shadowmap_pars_vertex:nl,shadowmap_vertex:ol,shadowmask_pars_fragment:sl,skinbase_vertex:ll,skinning_pars_vertex:cl,skinning_vertex:dl,skinnormal_vertex:ul,specularmap_fragment:fl,specularmap_pars_fragment:pl,tonemapping_fragment:ml,tonemapping_pars_fragment:hl,transmission_fragment:_l,transmission_pars_fragment:gl,uv_pars_fragment:vl,uv_pars_vertex:El,uv_vertex:Sl,worldpos_vertex:Tl,background_vert:Ml,background_frag:xl,backgroundCube_vert:Al,backgroundCube_frag:Rl,cube_vert:Cl,cube_frag:bl,depth_vert:Pl,depth_frag:Dl,distance_vert:Ul,distance_frag:Ll,equirect_vert:Nl,equirect_frag:wl,linedashed_vert:Il,linedashed_frag:yl,meshbasic_vert:Fl,meshbasic_frag:Ol,meshlambert_vert:Bl,meshlambert_frag:Gl,meshmatcap_vert:Hl,meshmatcap_frag:Vl,meshnormal_vert:Wl,meshnormal_frag:zl,meshphong_vert:kl,meshphong_frag:Xl,meshphysical_vert:Yl,meshphysical_frag:ql,meshtoon_vert:jl,meshtoon_frag:Kl,points_vert:Zl,points_frag:$l,shadow_vert:Ql,shadow_frag:Jl,sprite_vert:ec,sprite_frag:tc},ne={common:{diffuse:{value:new $e(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Fe},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Fe}},envmap:{envMap:{value:null},envMapRotation:{value:new Fe},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Fe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Fe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Fe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Fe},normalScale:{value:new ft(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Fe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Fe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Fe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Fe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new $e(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new Ie},probesMax:{value:new Ie},probesResolution:{value:new Ie}},points:{diffuse:{value:new $e(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0},uvTransform:{value:new Fe}},sprite:{diffuse:{value:new $e(16777215)},opacity:{value:1},center:{value:new ft(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Fe},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0}}},xt={basic:{uniforms:mt([ne.common,ne.specularmap,ne.envmap,ne.aomap,ne.lightmap,ne.fog]),vertexShader:be.meshbasic_vert,fragmentShader:be.meshbasic_frag},lambert:{uniforms:mt([ne.common,ne.specularmap,ne.envmap,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.fog,ne.lights,{emissive:{value:new $e(0)},envMapIntensity:{value:1}}]),vertexShader:be.meshlambert_vert,fragmentShader:be.meshlambert_frag},phong:{uniforms:mt([ne.common,ne.specularmap,ne.envmap,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.fog,ne.lights,{emissive:{value:new $e(0)},specular:{value:new $e(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:be.meshphong_vert,fragmentShader:be.meshphong_frag},standard:{uniforms:mt([ne.common,ne.envmap,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.roughnessmap,ne.metalnessmap,ne.fog,ne.lights,{emissive:{value:new $e(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:be.meshphysical_vert,fragmentShader:be.meshphysical_frag},toon:{uniforms:mt([ne.common,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.gradientmap,ne.fog,ne.lights,{emissive:{value:new $e(0)}}]),vertexShader:be.meshtoon_vert,fragmentShader:be.meshtoon_frag},matcap:{uniforms:mt([ne.common,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.fog,{matcap:{value:null}}]),vertexShader:be.meshmatcap_vert,fragmentShader:be.meshmatcap_frag},points:{uniforms:mt([ne.points,ne.fog]),vertexShader:be.points_vert,fragmentShader:be.points_frag},dashed:{uniforms:mt([ne.common,ne.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:be.linedashed_vert,fragmentShader:be.linedashed_frag},depth:{uniforms:mt([ne.common,ne.displacementmap]),vertexShader:be.depth_vert,fragmentShader:be.depth_frag},normal:{uniforms:mt([ne.common,ne.bumpmap,ne.normalmap,ne.displacementmap,{opacity:{value:1}}]),vertexShader:be.meshnormal_vert,fragmentShader:be.meshnormal_frag},sprite:{uniforms:mt([ne.sprite,ne.fog]),vertexShader:be.sprite_vert,fragmentShader:be.sprite_frag},background:{uniforms:{uvTransform:{value:new Fe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:be.background_vert,fragmentShader:be.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Fe}},vertexShader:be.backgroundCube_vert,fragmentShader:be.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:be.cube_vert,fragmentShader:be.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:be.equirect_vert,fragmentShader:be.equirect_frag},distance:{uniforms:mt([ne.common,ne.displacementmap,{referencePosition:{value:new Ie},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:be.distance_vert,fragmentShader:be.distance_frag},shadow:{uniforms:mt([ne.lights,ne.fog,{color:{value:new $e(0)},opacity:{value:1}}]),vertexShader:be.shadow_vert,fragmentShader:be.shadow_frag}};xt.physical={uniforms:mt([xt.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Fe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Fe},clearcoatNormalScale:{value:new ft(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Fe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Fe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Fe},sheen:{value:0},sheenColor:{value:new $e(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Fe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Fe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Fe},transmissionSamplerSize:{value:new ft},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Fe},attenuationDistance:{value:0},attenuationColor:{value:new $e(0)},specularColor:{value:new $e(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Fe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Fe},anisotropyVector:{value:new ft},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Fe}}]),vertexShader:be.meshphysical_vert,fragmentShader:be.meshphysical_frag};const Ia={r:0,b:0,g:0},ac=new Wt,wn=new Fe;wn.set(-1,0,0,0,1,0,0,0,1);function rc(e,a,t,r,l,n){const f=new $e(0);let m=l===!0?0:1,N,x,z=null,F=0,p=null;function T(h){let D=h.isScene===!0?h.background:null;if(D&&D.isTexture){const R=h.backgroundBlurriness>0;D=a.get(D,R)}return D}function P(h){let D=!1;const R=T(h);R===null?c(f,m):R&&R.isColor&&(c(R,1),D=!0);const V=e.xr.getEnvironmentBlendMode();V==="additive"?t.buffers.color.setClear(0,0,0,1,n):V==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,n),(e.autoClear||D)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function H(h,D){const R=T(D);R&&(R.isCubeTexture||R.mapping===sa)?(x===void 0&&(x=new Ct(new Sa(1,1,1),new bt({name:"BackgroundCubeMaterial",uniforms:Va(xt.backgroundCube.uniforms),vertexShader:xt.backgroundCube.vertexShader,fragmentShader:xt.backgroundCube.fragmentShader,side:ht,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),x.geometry.deleteAttribute("normal"),x.geometry.deleteAttribute("uv"),x.onBeforeRender=function(V,v,L){this.matrixWorld.copyPosition(L.matrixWorld)},Object.defineProperty(x.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(x)),x.material.uniforms.envMap.value=R,x.material.uniforms.backgroundBlurriness.value=D.backgroundBlurriness,x.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,x.material.uniforms.backgroundRotation.value.setFromMatrix4(ac.makeRotationFromEuler(D.backgroundRotation)).transpose(),R.isCubeTexture&&R.isRenderTargetTexture===!1&&x.material.uniforms.backgroundRotation.value.premultiply(wn),x.material.toneMapped=Qe.getTransfer(R.colorSpace)!==ke,(z!==R||F!==R.version||p!==e.toneMapping)&&(x.material.needsUpdate=!0,z=R,F=R.version,p=e.toneMapping),x.layers.enableAll(),h.unshift(x,x.geometry,x.material,0,0,null)):R&&R.isTexture&&(N===void 0&&(N=new Ct(new Wa(2,2),new bt({name:"BackgroundMaterial",uniforms:Va(xt.background.uniforms),vertexShader:xt.background.vertexShader,fragmentShader:xt.background.fragmentShader,side:Qt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),N.geometry.deleteAttribute("normal"),Object.defineProperty(N.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(N)),N.material.uniforms.t2D.value=R,N.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,N.material.toneMapped=Qe.getTransfer(R.colorSpace)!==ke,R.matrixAutoUpdate===!0&&R.updateMatrix(),N.material.uniforms.uvTransform.value.copy(R.matrix),(z!==R||F!==R.version||p!==e.toneMapping)&&(N.material.needsUpdate=!0,z=R,F=R.version,p=e.toneMapping),N.layers.enableAll(),h.unshift(N,N.geometry,N.material,0,0,null))}function c(h,D){h.getRGB(Ia,pi(e)),t.buffers.color.setClear(Ia.r,Ia.g,Ia.b,D,n)}function s(){x!==void 0&&(x.geometry.dispose(),x.material.dispose(),x=void 0),N!==void 0&&(N.geometry.dispose(),N.material.dispose(),N=void 0)}return{getClearColor:function(){return f},setClearColor:function(h,D=1){f.set(h),m=D,c(f,m)},getClearAlpha:function(){return m},setClearAlpha:function(h){m=h,c(f,m)},render:P,addToRenderList:H,dispose:s}}function ic(e,a){const t=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},l=p(null);let n=l,f=!1;function m(A,I,Z,q,y){let G=!1;const B=F(A,q,Z,I);n!==B&&(n=B,x(n.object)),G=T(A,q,Z,y),G&&P(A,q,Z,y),y!==null&&a.update(y,e.ELEMENT_ARRAY_BUFFER),(G||f)&&(f=!1,R(A,I,Z,q),y!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,a.get(y).buffer))}function N(){return e.createVertexArray()}function x(A){return e.bindVertexArray(A)}function z(A){return e.deleteVertexArray(A)}function F(A,I,Z,q){const y=q.wireframe===!0;let G=r[I.id];G===void 0&&(G={},r[I.id]=G);const B=A.isInstancedMesh===!0?A.id:0;let Q=G[B];Q===void 0&&(Q={},G[B]=Q);let de=Q[Z.id];de===void 0&&(de={},Q[Z.id]=de);let fe=de[y];return fe===void 0&&(fe=p(N()),de[y]=fe),fe}function p(A){const I=[],Z=[],q=[];for(let y=0;y<t;y++)I[y]=0,Z[y]=0,q[y]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:Z,attributeDivisors:q,object:A,attributes:{},index:null}}function T(A,I,Z,q){const y=n.attributes,G=I.attributes;let B=0;const Q=Z.getAttributes();for(const de in Q)if(Q[de].location>=0){const fe=y[de];let Ae=G[de];if(Ae===void 0&&(de==="instanceMatrix"&&A.instanceMatrix&&(Ae=A.instanceMatrix),de==="instanceColor"&&A.instanceColor&&(Ae=A.instanceColor)),fe===void 0||fe.attribute!==Ae||Ae&&fe.data!==Ae.data)return!0;B++}return n.attributesNum!==B||n.index!==q}function P(A,I,Z,q){const y={},G=I.attributes;let B=0;const Q=Z.getAttributes();for(const de in Q)if(Q[de].location>=0){let fe=G[de];fe===void 0&&(de==="instanceMatrix"&&A.instanceMatrix&&(fe=A.instanceMatrix),de==="instanceColor"&&A.instanceColor&&(fe=A.instanceColor));const Ae={};Ae.attribute=fe,fe&&fe.data&&(Ae.data=fe.data),y[de]=Ae,B++}n.attributes=y,n.attributesNum=B,n.index=q}function H(){const A=n.newAttributes;for(let I=0,Z=A.length;I<Z;I++)A[I]=0}function c(A){s(A,0)}function s(A,I){const Z=n.newAttributes,q=n.enabledAttributes,y=n.attributeDivisors;Z[A]=1,q[A]===0&&(e.enableVertexAttribArray(A),q[A]=1),y[A]!==I&&(e.vertexAttribDivisor(A,I),y[A]=I)}function h(){const A=n.newAttributes,I=n.enabledAttributes;for(let Z=0,q=I.length;Z<q;Z++)I[Z]!==A[Z]&&(e.disableVertexAttribArray(Z),I[Z]=0)}function D(A,I,Z,q,y,G,B){B===!0?e.vertexAttribIPointer(A,I,Z,y,G):e.vertexAttribPointer(A,I,Z,q,y,G)}function R(A,I,Z,q){H();const y=q.attributes,G=Z.getAttributes(),B=I.defaultAttributeValues;for(const Q in G){const de=G[Q];if(de.location>=0){let fe=y[Q];if(fe===void 0&&(Q==="instanceMatrix"&&A.instanceMatrix&&(fe=A.instanceMatrix),Q==="instanceColor"&&A.instanceColor&&(fe=A.instanceColor)),fe!==void 0){const Ae=fe.normalized,De=fe.itemSize,Ve=a.get(fe);if(Ve===void 0)continue;const Ye=Ve.buffer,Ue=Ve.type,X=Ve.bytesPerElement,ie=Ue===e.INT||Ue===e.UNSIGNED_INT||fe.gpuType===za;if(fe.isInterleavedBufferAttribute){const te=fe.data,Te=te.stride,Ce=fe.offset;if(te.isInstancedInterleavedBuffer){for(let pe=0;pe<de.locationSize;pe++)s(de.location+pe,te.meshPerAttribute);A.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=te.meshPerAttribute*te.count)}else for(let pe=0;pe<de.locationSize;pe++)c(de.location+pe);e.bindBuffer(e.ARRAY_BUFFER,Ye);for(let pe=0;pe<de.locationSize;pe++)D(de.location+pe,De/de.locationSize,Ue,Ae,Te*X,(Ce+De/de.locationSize*pe)*X,ie)}else{if(fe.isInstancedBufferAttribute){for(let te=0;te<de.locationSize;te++)s(de.location+te,fe.meshPerAttribute);A.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=fe.meshPerAttribute*fe.count)}else for(let te=0;te<de.locationSize;te++)c(de.location+te);e.bindBuffer(e.ARRAY_BUFFER,Ye);for(let te=0;te<de.locationSize;te++)D(de.location+te,De/de.locationSize,Ue,Ae,De*X,De/de.locationSize*te*X,ie)}}else if(B!==void 0){const Ae=B[Q];if(Ae!==void 0)switch(Ae.length){case 2:e.vertexAttrib2fv(de.location,Ae);break;case 3:e.vertexAttrib3fv(de.location,Ae);break;case 4:e.vertexAttrib4fv(de.location,Ae);break;default:e.vertexAttrib1fv(de.location,Ae)}}}}h()}function V(){g();for(const A in r){const I=r[A];for(const Z in I){const q=I[Z];for(const y in q){const G=q[y];for(const B in G)z(G[B].object),delete G[B];delete q[y]}}delete r[A]}}function v(A){if(r[A.id]===void 0)return;const I=r[A.id];for(const Z in I){const q=I[Z];for(const y in q){const G=q[y];for(const B in G)z(G[B].object),delete G[B];delete q[y]}}delete r[A.id]}function L(A){for(const I in r){const Z=r[I];for(const q in Z){const y=Z[q];if(y[A.id]===void 0)continue;const G=y[A.id];for(const B in G)z(G[B].object),delete G[B];delete y[A.id]}}}function d(A){for(const I in r){const Z=r[I],q=A.isInstancedMesh===!0?A.id:0,y=Z[q];if(y!==void 0){for(const G in y){const B=y[G];for(const Q in B)z(B[Q].object),delete B[Q];delete y[G]}delete Z[q],Object.keys(Z).length===0&&delete r[I]}}}function g(){O(),f=!0,n!==l&&(n=l,x(n.object))}function O(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:m,reset:g,resetDefaultState:O,dispose:V,releaseStatesOfGeometry:v,releaseStatesOfObject:d,releaseStatesOfProgram:L,initAttributes:H,enableAttribute:c,disableUnusedAttributes:h}}function nc(e,a,t){let r;function l(N){r=N}function n(N,x){e.drawArrays(r,N,x),t.update(x,r,1)}function f(N,x,z){z!==0&&(e.drawArraysInstanced(r,N,x,z),t.update(x,r,z))}function m(N,x,z){if(z===0)return;a.get("WEBGL_multi_draw").multiDrawArraysWEBGL(r,N,0,x,0,z);let F=0;for(let p=0;p<z;p++)F+=x[p];t.update(F,r,1)}this.setMode=l,this.render=n,this.renderInstances=f,this.renderMultiDraw=m}function oc(e,a,t,r){let l;function n(){if(l!==void 0)return l;if(a.has("EXT_texture_filter_anisotropic")===!0){const L=a.get("EXT_texture_filter_anisotropic");l=e.getParameter(L.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else l=0;return l}function f(L){return!(L!==Pt&&r.convert(L)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function m(L){const d=L===wt&&(a.has("EXT_color_buffer_half_float")||a.has("EXT_color_buffer_float"));return!(L!==St&&r.convert(L)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&L!==It&&!d)}function N(L){if(L==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";L="mediump"}return L==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let x=t.precision!==void 0?t.precision:"highp";const z=N(x);z!==x&&(Be("WebGLRenderer:",x,"not supported, using",z,"instead."),x=z);const F=t.logarithmicDepthBuffer===!0,p=t.reversedDepthBuffer===!0&&a.has("EXT_clip_control");t.reversedDepthBuffer===!0&&p===!1&&Be("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const T=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),P=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),H=e.getParameter(e.MAX_TEXTURE_SIZE),c=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),s=e.getParameter(e.MAX_VERTEX_ATTRIBS),h=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),D=e.getParameter(e.MAX_VARYING_VECTORS),R=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),V=e.getParameter(e.MAX_SAMPLES),v=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:n,getMaxPrecision:N,textureFormatReadable:f,textureTypeReadable:m,precision:x,logarithmicDepthBuffer:F,reversedDepthBuffer:p,maxTextures:T,maxVertexTextures:P,maxTextureSize:H,maxCubemapSize:c,maxAttributes:s,maxVertexUniforms:h,maxVaryings:D,maxFragmentUniforms:R,maxSamples:V,samples:v}}function sc(e){const a=this;let t=null,r=0,l=!1,n=!1;const f=new mi,m=new Fe,N={value:null,needsUpdate:!1};this.uniform=N,this.numPlanes=0,this.numIntersection=0,this.init=function(F,p){const T=F.length!==0||p||r!==0||l;return l=p,r=F.length,T},this.beginShadows=function(){n=!0,z(null)},this.endShadows=function(){n=!1},this.setGlobalState=function(F,p){t=z(F,p,0)},this.setState=function(F,p,T){const P=F.clippingPlanes,H=F.clipIntersection,c=F.clipShadows,s=e.get(F);if(!l||P===null||P.length===0||n&&!c)n?z(null):x();else{const h=n?0:r,D=h*4;let R=s.clippingState||null;N.value=R,R=z(P,p,D,T);for(let V=0;V!==D;++V)R[V]=t[V];s.clippingState=R,this.numIntersection=H?this.numPlanes:0,this.numPlanes+=h}};function x(){N.value!==t&&(N.value=t,N.needsUpdate=r>0),a.numPlanes=r,a.numIntersection=0}function z(F,p,T,P){const H=F!==null?F.length:0;let c=null;if(H!==0){if(c=N.value,P!==!0||c===null){const s=T+H*4,h=p.matrixWorldInverse;m.getNormalMatrix(h),(c===null||c.length<s)&&(c=new Float32Array(s));for(let D=0,R=T;D!==H;++D,R+=4)f.copy(F[D]).applyMatrix4(h,m),f.normal.toArray(c,R),c[R+3]=f.constant}N.value=c,N.needsUpdate=!0}return a.numPlanes=H,a.numIntersection=0,c}}const Gt=4,In=[.125,.215,.35,.446,.526,.582],Kt=20,lc=256,ha=new ka,yn=new $e;let Kr=null,Zr=0,$r=0,Qr=!1;const cc=new Ie;class Jr{constructor(a){this._renderer=a,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(a,t=0,r=.1,l=100,n={}){const{size:f=256,position:m=cc}=n;Kr=this._renderer.getRenderTarget(),Zr=this._renderer.getActiveCubeFace(),$r=this._renderer.getActiveMipmapLevel(),Qr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(f);const N=this._allocateTargets();return N.depthBuffer=!0,this._sceneToCubeUV(a,r,l,N,m),t>0&&this._blur(N,0,0,t),this._applyPMREM(N),this._cleanup(N),N}fromEquirectangular(a,t=null){return this._fromTexture(a,t)}fromCubemap(a,t=null){return this._fromTexture(a,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Bn(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=On(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(a){this._lodMax=Math.floor(Math.log2(a)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let a=0;a<this._lodMeshes.length;a++)this._lodMeshes[a].geometry.dispose()}_cleanup(a){this._renderer.setRenderTarget(Kr,Zr,$r),this._renderer.xr.enabled=Qr,a.scissorTest=!1,ia(a,0,0,a.width,a.height)}_fromTexture(a,t){a.mapping===Jt||a.mapping===zt?this._setSize(a.image.length===0?16:a.image[0].width||a.image[0].image.width):this._setSize(a.image.width/4),Kr=this._renderer.getRenderTarget(),Zr=this._renderer.getActiveCubeFace(),$r=this._renderer.getActiveMipmapLevel(),Qr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const r=t||this._allocateTargets();return this._textureToCubeUV(a,r),this._applyPMREM(r),this._cleanup(r),r}_allocateTargets(){const a=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,r={magFilter:_t,minFilter:_t,generateMipmaps:!1,type:wt,format:Pt,colorSpace:Xa,depthBuffer:!1},l=Fn(a,t,r);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==a||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Fn(a,t,r);const{_lodMax:n}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=dc(n)),this._blurMaterial=fc(n,a,t),this._ggxMaterial=uc(n,a,t)}return l}_compileMaterial(a){const t=new Ct(new la,a);this._renderer.compile(t,ha)}_sceneToCubeUV(a,t,r,l,n){const f=new ca(90,1,t,r),m=[1,-1,1,1,1,1],N=[1,1,1,-1,-1,-1],x=this._renderer,z=x.autoClear,F=x.toneMapping;x.getClearColor(yn),x.toneMapping=Tt,x.autoClear=!1,x.state.buffers.depth.getReversed()&&(x.setRenderTarget(l),x.clearDepth(),x.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Ct(new Sa,new hi({name:"PMREM.Background",side:ht,depthWrite:!1,depthTest:!1})));const p=this._backgroundBox,T=p.material;let P=!1;const H=a.background;H?H.isColor&&(T.color.copy(H),a.background=null,P=!0):(T.color.copy(yn),P=!0);for(let c=0;c<6;c++){const s=c%3;s===0?(f.up.set(0,m[c],0),f.position.set(n.x,n.y,n.z),f.lookAt(n.x+N[c],n.y,n.z)):s===1?(f.up.set(0,0,m[c]),f.position.set(n.x,n.y,n.z),f.lookAt(n.x,n.y+N[c],n.z)):(f.up.set(0,m[c],0),f.position.set(n.x,n.y,n.z),f.lookAt(n.x,n.y,n.z+N[c]));const h=this._cubeSize;ia(l,s*h,c>2?h:0,h,h),x.setRenderTarget(l),P&&x.render(p,f),x.render(a,f)}x.toneMapping=F,x.autoClear=z,a.background=H}_textureToCubeUV(a,t){const r=this._renderer,l=a.mapping===Jt||a.mapping===zt;l?(this._cubemapMaterial===null&&(this._cubemapMaterial=Bn()),this._cubemapMaterial.uniforms.flipEnvMap.value=a.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=On());const n=l?this._cubemapMaterial:this._equirectMaterial,f=this._lodMeshes[0];f.material=n;const m=n.uniforms;m.envMap.value=a;const N=this._cubeSize;ia(t,0,0,3*N,2*N),r.setRenderTarget(t),r.render(f,ha)}_applyPMREM(a){const t=this._renderer,r=t.autoClear;t.autoClear=!1;const l=this._lodMeshes.length;for(let n=1;n<l;n++)this._applyGGXFilter(a,n-1,n);t.autoClear=r}_applyGGXFilter(a,t,r){const l=this._renderer,n=this._pingPongRenderTarget,f=this._ggxMaterial,m=this._lodMeshes[r];m.material=f;const N=f.uniforms,x=r/(this._lodMeshes.length-1),z=t/(this._lodMeshes.length-1),F=Math.sqrt(x*x-z*z),p=0+x*1.25,T=F*p,{_lodMax:P}=this,H=this._sizeLods[r],c=3*H*(r>P-Gt?r-P+Gt:0),s=4*(this._cubeSize-H);N.envMap.value=a.texture,N.roughness.value=T,N.mipInt.value=P-t,ia(n,c,s,3*H,2*H),l.setRenderTarget(n),l.render(m,ha),N.envMap.value=n.texture,N.roughness.value=0,N.mipInt.value=P-r,ia(a,c,s,3*H,2*H),l.setRenderTarget(a),l.render(m,ha)}_blur(a,t,r,l,n){const f=this._pingPongRenderTarget;this._halfBlur(a,f,t,r,l,"latitudinal",n),this._halfBlur(f,a,r,r,l,"longitudinal",n)}_halfBlur(a,t,r,l,n,f,m){const N=this._renderer,x=this._blurMaterial;f!=="latitudinal"&&f!=="longitudinal"&&Xe("blur direction must be either latitudinal or longitudinal!");const z=3,F=this._lodMeshes[l];F.material=x;const p=x.uniforms,T=this._sizeLods[r]-1,P=isFinite(n)?Math.PI/(2*T):2*Math.PI/(2*Kt-1),H=n/P,c=isFinite(n)?1+Math.floor(z*H):Kt;c>Kt&&Be(`sigmaRadians, ${n}, is too large and will clip, as it requested ${c} samples when the maximum is set to ${Kt}`);const s=[];let h=0;for(let L=0;L<Kt;++L){const d=L/H,g=Math.exp(-d*d/2);s.push(g),L===0?h+=g:L<c&&(h+=2*g)}for(let L=0;L<s.length;L++)s[L]=s[L]/h;p.envMap.value=a.texture,p.samples.value=c,p.weights.value=s,p.latitudinal.value=f==="latitudinal",m&&(p.poleAxis.value=m);const{_lodMax:D}=this;p.dTheta.value=P,p.mipInt.value=D-r;const R=this._sizeLods[l],V=3*R*(l>D-Gt?l-D+Gt:0),v=4*(this._cubeSize-R);ia(t,V,v,3*R,2*R),N.setRenderTarget(t),N.render(F,ha)}}function dc(e){const a=[],t=[],r=[];let l=e;const n=e-Gt+1+In.length;for(let f=0;f<n;f++){const m=Math.pow(2,l);a.push(m);let N=1/m;f>e-Gt?N=In[f-e+Gt-1]:f===0&&(N=0),t.push(N);const x=1/(m-2),z=-x,F=1+x,p=[z,z,F,z,F,F,z,z,F,F,z,F],T=6,P=6,H=3,c=2,s=1,h=new Float32Array(H*P*T),D=new Float32Array(c*P*T),R=new Float32Array(s*P*T);for(let v=0;v<T;v++){const L=v%3*2/3-1,d=v>2?0:-1,g=[L,d,0,L+2/3,d,0,L+2/3,d+1,0,L,d,0,L+2/3,d+1,0,L,d+1,0];h.set(g,H*P*v),D.set(p,c*P*v);const O=[v,v,v,v,v,v];R.set(O,s*P*v)}const V=new la;V.setAttribute("position",new da(h,H)),V.setAttribute("uv",new da(D,c)),V.setAttribute("faceIndex",new da(R,s)),r.push(new Ct(V,null)),l>Gt&&l--}return{lodMeshes:r,sizeLods:a,sigmas:t}}function Fn(e,a,t){const r=new Mt(e,a,t);return r.texture.mapping=sa,r.texture.name="PMREM.cubeUv",r.scissorTest=!0,r}function ia(e,a,t,r,l){e.viewport.set(a,t,r,l),e.scissor.set(a,t,r,l)}function uc(e,a,t){return new bt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:lc,CUBEUV_TEXEL_WIDTH:1/a,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:ya(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Dt,depthTest:!1,depthWrite:!1})}function fc(e,a,t){const r=new Float32Array(Kt),l=new Ie(0,1,0);return new bt({name:"SphericalGaussianBlur",defines:{n:Kt,CUBEUV_TEXEL_WIDTH:1/a,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:l}},vertexShader:ya(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Dt,depthTest:!1,depthWrite:!1})}function On(){return new bt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ya(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Dt,depthTest:!1,depthWrite:!1})}function Bn(){return new bt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ya(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Dt,depthTest:!1,depthWrite:!1})}function ya(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}class ei extends Mt{constructor(a=1,t={}){super(a,a,t),this.isWebGLCubeRenderTarget=!0;const r={width:a,height:a,depth:1},l=[r,r,r,r,r,r];this.texture=new Ya(l),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(a,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const r={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},l=new Sa(5,5,5),n=new bt({name:"CubemapFromEquirect",uniforms:Va(r.uniforms),vertexShader:r.vertexShader,fragmentShader:r.fragmentShader,side:ht,blending:Dt});n.uniforms.tEquirect.value=t;const f=new Ct(l,n),m=t.minFilter;return t.minFilter===kt&&(t.minFilter=_t),new _i(1,10,this).update(a,f),t.minFilter=m,f.geometry.dispose(),f.material.dispose(),this}clear(a,t=!0,r=!0,l=!0){const n=a.getRenderTarget();for(let f=0;f<6;f++)a.setRenderTarget(this,f),a.clear(t,r,l);a.setRenderTarget(n)}}function pc(e){let a=new WeakMap,t=new WeakMap,r=null;function l(p,T=!1){return p==null?null:T?f(p):n(p)}function n(p){if(p&&p.isTexture){const T=p.mapping;if(T===Ta||T===Ma)if(a.has(p)){const P=a.get(p).texture;return m(P,p.mapping)}else{const P=p.image;if(P&&P.height>0){const H=new ei(P.height);return H.fromEquirectangularTexture(e,p),a.set(p,H),p.addEventListener("dispose",x),m(H.texture,p.mapping)}else return null}}return p}function f(p){if(p&&p.isTexture){const T=p.mapping,P=T===Ta||T===Ma,H=T===Jt||T===zt;if(P||H){let c=t.get(p);const s=c!==void 0?c.texture.pmremVersion:0;if(p.isRenderTargetTexture&&p.pmremVersion!==s)return r===null&&(r=new Jr(e)),c=P?r.fromEquirectangular(p,c):r.fromCubemap(p,c),c.texture.pmremVersion=p.pmremVersion,t.set(p,c),c.texture;if(c!==void 0)return c.texture;{const h=p.image;return P&&h&&h.height>0||H&&h&&N(h)?(r===null&&(r=new Jr(e)),c=P?r.fromEquirectangular(p):r.fromCubemap(p),c.texture.pmremVersion=p.pmremVersion,t.set(p,c),p.addEventListener("dispose",z),c.texture):null}}}return p}function m(p,T){return T===Ta?p.mapping=Jt:T===Ma&&(p.mapping=zt),p}function N(p){let T=0;const P=6;for(let H=0;H<P;H++)p[H]!==void 0&&T++;return T===P}function x(p){const T=p.target;T.removeEventListener("dispose",x);const P=a.get(T);P!==void 0&&(a.delete(T),P.dispose())}function z(p){const T=p.target;T.removeEventListener("dispose",z);const P=t.get(T);P!==void 0&&(t.delete(T),P.dispose())}function F(){a=new WeakMap,t=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:l,dispose:F}}function mc(e){const a={};function t(r){if(a[r]!==void 0)return a[r];const l=e.getExtension(r);return a[r]=l,l}return{has:function(r){return t(r)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(r){const l=t(r);return l===null&&gi("WebGLRenderer: "+r+" extension not supported."),l}}}function hc(e,a,t,r){const l={},n=new WeakMap;function f(F){const p=F.target;p.index!==null&&a.remove(p.index);for(const P in p.attributes)a.remove(p.attributes[P]);p.removeEventListener("dispose",f),delete l[p.id];const T=n.get(p);T&&(a.remove(T),n.delete(p)),r.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,t.memory.geometries--}function m(F,p){return l[p.id]===!0||(p.addEventListener("dispose",f),l[p.id]=!0,t.memory.geometries++),p}function N(F){const p=F.attributes;for(const T in p)a.update(p[T],e.ARRAY_BUFFER)}function x(F){const p=[],T=F.index,P=F.attributes.position;let H=0;if(P===void 0)return;if(T!==null){const h=T.array;H=T.version;for(let D=0,R=h.length;D<R;D+=3){const V=h[D+0],v=h[D+1],L=h[D+2];p.push(V,v,v,L,L,V)}}else{const h=P.array;H=P.version;for(let D=0,R=h.length/3-1;D<R;D+=3){const V=D+0,v=D+1,L=D+2;p.push(V,v,v,L,L,V)}}const c=new(P.count>=65535?vi:Ei)(p,1);c.version=H;const s=n.get(F);s&&a.remove(s),n.set(F,c)}function z(F){const p=n.get(F);if(p){const T=F.index;T!==null&&p.version<T.version&&x(F)}else x(F);return n.get(F)}return{get:m,update:N,getWireframeAttribute:z}}function _c(e,a,t){let r;function l(F){r=F}let n,f;function m(F){n=F.type,f=F.bytesPerElement}function N(F,p){e.drawElements(r,p,n,F*f),t.update(p,r,1)}function x(F,p,T){T!==0&&(e.drawElementsInstanced(r,p,n,F*f,T),t.update(p,r,T))}function z(F,p,T){if(T===0)return;a.get("WEBGL_multi_draw").multiDrawElementsWEBGL(r,p,0,n,F,0,T);let P=0;for(let H=0;H<T;H++)P+=p[H];t.update(P,r,1)}this.setMode=l,this.setIndex=m,this.render=N,this.renderInstances=x,this.renderMultiDraw=z}function gc(e){const a={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function r(n,f,m){switch(t.calls++,f){case e.TRIANGLES:t.triangles+=m*(n/3);break;case e.LINES:t.lines+=m*(n/2);break;case e.LINE_STRIP:t.lines+=m*(n-1);break;case e.LINE_LOOP:t.lines+=m*n;break;case e.POINTS:t.points+=m*n;break;default:Xe("WebGLInfo: Unknown draw mode:",f);break}}function l(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:a,render:t,programs:null,autoReset:!0,reset:l,update:r}}function vc(e,a,t){const r=new WeakMap,l=new pt;function n(f,m,N){const x=f.morphTargetInfluences,z=m.morphAttributes.position||m.morphAttributes.normal||m.morphAttributes.color,F=z!==void 0?z.length:0;let p=r.get(m);if(p===void 0||p.count!==F){let T=function(){d.dispose(),r.delete(m),m.removeEventListener("dispose",T)};p!==void 0&&p.texture.dispose();const P=m.morphAttributes.position!==void 0,H=m.morphAttributes.normal!==void 0,c=m.morphAttributes.color!==void 0,s=m.morphAttributes.position||[],h=m.morphAttributes.normal||[],D=m.morphAttributes.color||[];let R=0;P===!0&&(R=1),H===!0&&(R=2),c===!0&&(R=3);let V=m.attributes.position.count*R,v=1;V>a.maxTextureSize&&(v=Math.ceil(V/a.maxTextureSize),V=a.maxTextureSize);const L=new Float32Array(V*v*4*F),d=new qa(L,V,v,F);d.type=It,d.needsUpdate=!0;const g=R*4;for(let O=0;O<F;O++){const A=s[O],I=h[O],Z=D[O],q=V*v*4*O;for(let y=0;y<A.count;y++){const G=y*g;P===!0&&(l.fromBufferAttribute(A,y),L[q+G+0]=l.x,L[q+G+1]=l.y,L[q+G+2]=l.z,L[q+G+3]=0),H===!0&&(l.fromBufferAttribute(I,y),L[q+G+4]=l.x,L[q+G+5]=l.y,L[q+G+6]=l.z,L[q+G+7]=0),c===!0&&(l.fromBufferAttribute(Z,y),L[q+G+8]=l.x,L[q+G+9]=l.y,L[q+G+10]=l.z,L[q+G+11]=Z.itemSize===4?l.w:1)}}p={count:F,texture:d,size:new ft(V,v)},r.set(m,p),m.addEventListener("dispose",T)}if(f.isInstancedMesh===!0&&f.morphTexture!==null)N.getUniforms().setValue(e,"morphTexture",f.morphTexture,t);else{let T=0;for(let H=0;H<x.length;H++)T+=x[H];const P=m.morphTargetsRelative?1:1-T;N.getUniforms().setValue(e,"morphTargetBaseInfluence",P),N.getUniforms().setValue(e,"morphTargetInfluences",x)}N.getUniforms().setValue(e,"morphTargetsTexture",p.texture,t),N.getUniforms().setValue(e,"morphTargetsTextureSize",p.size)}return{update:n}}function Ec(e,a,t,r,l){let n=new WeakMap;function f(x){const z=l.render.frame,F=x.geometry,p=a.get(x,F);if(n.get(p)!==z&&(a.update(p),n.set(p,z)),x.isInstancedMesh&&(x.hasEventListener("dispose",N)===!1&&x.addEventListener("dispose",N),n.get(x)!==z&&(t.update(x.instanceMatrix,e.ARRAY_BUFFER),x.instanceColor!==null&&t.update(x.instanceColor,e.ARRAY_BUFFER),n.set(x,z))),x.isSkinnedMesh){const T=x.skeleton;n.get(T)!==z&&(T.update(),n.set(T,z))}return p}function m(){n=new WeakMap}function N(x){const z=x.target;z.removeEventListener("dispose",N),r.releaseStatesOfObject(z),t.remove(z.instanceMatrix),z.instanceColor!==null&&t.remove(z.instanceColor)}return{update:f,dispose:m}}const Sc={[tr]:"LINEAR_TONE_MAPPING",[er]:"REINHARD_TONE_MAPPING",[Ja]:"CINEON_TONE_MAPPING",[Qa]:"ACES_FILMIC_TONE_MAPPING",[$a]:"AGX_TONE_MAPPING",[Za]:"NEUTRAL_TONE_MAPPING",[Ka]:"CUSTOM_TONE_MAPPING"};function Tc(e,a,t,r,l){const n=new Mt(a,t,{type:e,depthBuffer:r,stencilBuffer:l,depthTexture:r?new ea(a,t):void 0}),f=new Mt(a,t,{type:wt,depthBuffer:!1,stencilBuffer:!1}),m=new la;m.setAttribute("position",new ja([-1,3,0,-1,-1,0,3,-1,0],3)),m.setAttribute("uv",new ja([0,2,0,0,2,0],2));const N=new Si({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),x=new Ct(m,N),z=new ka(-1,1,1,-1,0,1);let F=null,p=null,T=!1,P,H=null,c=[],s=!1;this.setSize=function(h,D){n.setSize(h,D),f.setSize(h,D);for(let R=0;R<c.length;R++){const V=c[R];V.setSize&&V.setSize(h,D)}},this.setEffects=function(h){c=h,s=c.length>0&&c[0].isRenderPass===!0;const D=n.width,R=n.height;for(let V=0;V<c.length;V++){const v=c[V];v.setSize&&v.setSize(D,R)}},this.begin=function(h,D){if(T||h.toneMapping===Tt&&c.length===0)return!1;if(H=D,D!==null){const R=D.width,V=D.height;(n.width!==R||n.height!==V)&&this.setSize(R,V)}return s===!1&&h.setRenderTarget(n),P=h.toneMapping,h.toneMapping=Tt,!0},this.hasRenderPass=function(){return s},this.end=function(h,D){h.toneMapping=P,T=!0;let R=n,V=f;for(let v=0;v<c.length;v++){const L=c[v];if(L.enabled!==!1&&(L.render(h,V,R,D),L.needsSwap!==!1)){const d=R;R=V,V=d}}if(F!==h.outputColorSpace||p!==h.toneMapping){F=h.outputColorSpace,p=h.toneMapping,N.defines={},Qe.getTransfer(F)===ke&&(N.defines.SRGB_TRANSFER="");const v=Sc[p];v&&(N.defines[v]=""),N.needsUpdate=!0}N.uniforms.tDiffuse.value=R.texture,h.setRenderTarget(H),h.render(x,z),H=null,T=!1},this.isCompositing=function(){return T},this.dispose=function(){n.depthTexture&&n.depthTexture.dispose(),n.dispose(),f.dispose(),m.dispose(),N.dispose()}}const Gn=new Mi,ti=new ea(1,1),Hn=new qa,Vn=new Ti,Wn=new Ya,zn=[],kn=[],Xn=new Float32Array(16),Yn=new Float32Array(9),qn=new Float32Array(4);function na(e,a,t){const r=e[0];if(r<=0||r>0)return e;const l=a*t;let n=zn[l];if(n===void 0&&(n=new Float32Array(l),zn[l]=n),a!==0){r.toArray(n,0);for(let f=1,m=0;f!==a;++f)m+=t,e[f].toArray(n,m)}return n}function ot(e,a){if(e.length!==a.length)return!1;for(let t=0,r=e.length;t<r;t++)if(e[t]!==a[t])return!1;return!0}function st(e,a){for(let t=0,r=a.length;t<r;t++)e[t]=a[t]}function Fa(e,a){let t=kn[a];t===void 0&&(t=new Int32Array(a),kn[a]=t);for(let r=0;r!==a;++r)t[r]=e.allocateTextureUnit();return t}function Mc(e,a){const t=this.cache;t[0]!==a&&(e.uniform1f(this.addr,a),t[0]=a)}function xc(e,a){const t=this.cache;if(a.x!==void 0)(t[0]!==a.x||t[1]!==a.y)&&(e.uniform2f(this.addr,a.x,a.y),t[0]=a.x,t[1]=a.y);else{if(ot(t,a))return;e.uniform2fv(this.addr,a),st(t,a)}}function Ac(e,a){const t=this.cache;if(a.x!==void 0)(t[0]!==a.x||t[1]!==a.y||t[2]!==a.z)&&(e.uniform3f(this.addr,a.x,a.y,a.z),t[0]=a.x,t[1]=a.y,t[2]=a.z);else if(a.r!==void 0)(t[0]!==a.r||t[1]!==a.g||t[2]!==a.b)&&(e.uniform3f(this.addr,a.r,a.g,a.b),t[0]=a.r,t[1]=a.g,t[2]=a.b);else{if(ot(t,a))return;e.uniform3fv(this.addr,a),st(t,a)}}function Rc(e,a){const t=this.cache;if(a.x!==void 0)(t[0]!==a.x||t[1]!==a.y||t[2]!==a.z||t[3]!==a.w)&&(e.uniform4f(this.addr,a.x,a.y,a.z,a.w),t[0]=a.x,t[1]=a.y,t[2]=a.z,t[3]=a.w);else{if(ot(t,a))return;e.uniform4fv(this.addr,a),st(t,a)}}function Cc(e,a){const t=this.cache,r=a.elements;if(r===void 0){if(ot(t,a))return;e.uniformMatrix2fv(this.addr,!1,a),st(t,a)}else{if(ot(t,r))return;qn.set(r),e.uniformMatrix2fv(this.addr,!1,qn),st(t,r)}}function bc(e,a){const t=this.cache,r=a.elements;if(r===void 0){if(ot(t,a))return;e.uniformMatrix3fv(this.addr,!1,a),st(t,a)}else{if(ot(t,r))return;Yn.set(r),e.uniformMatrix3fv(this.addr,!1,Yn),st(t,r)}}function Pc(e,a){const t=this.cache,r=a.elements;if(r===void 0){if(ot(t,a))return;e.uniformMatrix4fv(this.addr,!1,a),st(t,a)}else{if(ot(t,r))return;Xn.set(r),e.uniformMatrix4fv(this.addr,!1,Xn),st(t,r)}}function Dc(e,a){const t=this.cache;t[0]!==a&&(e.uniform1i(this.addr,a),t[0]=a)}function Uc(e,a){const t=this.cache;if(a.x!==void 0)(t[0]!==a.x||t[1]!==a.y)&&(e.uniform2i(this.addr,a.x,a.y),t[0]=a.x,t[1]=a.y);else{if(ot(t,a))return;e.uniform2iv(this.addr,a),st(t,a)}}function Lc(e,a){const t=this.cache;if(a.x!==void 0)(t[0]!==a.x||t[1]!==a.y||t[2]!==a.z)&&(e.uniform3i(this.addr,a.x,a.y,a.z),t[0]=a.x,t[1]=a.y,t[2]=a.z);else{if(ot(t,a))return;e.uniform3iv(this.addr,a),st(t,a)}}function Nc(e,a){const t=this.cache;if(a.x!==void 0)(t[0]!==a.x||t[1]!==a.y||t[2]!==a.z||t[3]!==a.w)&&(e.uniform4i(this.addr,a.x,a.y,a.z,a.w),t[0]=a.x,t[1]=a.y,t[2]=a.z,t[3]=a.w);else{if(ot(t,a))return;e.uniform4iv(this.addr,a),st(t,a)}}function wc(e,a){const t=this.cache;t[0]!==a&&(e.uniform1ui(this.addr,a),t[0]=a)}function Ic(e,a){const t=this.cache;if(a.x!==void 0)(t[0]!==a.x||t[1]!==a.y)&&(e.uniform2ui(this.addr,a.x,a.y),t[0]=a.x,t[1]=a.y);else{if(ot(t,a))return;e.uniform2uiv(this.addr,a),st(t,a)}}function yc(e,a){const t=this.cache;if(a.x!==void 0)(t[0]!==a.x||t[1]!==a.y||t[2]!==a.z)&&(e.uniform3ui(this.addr,a.x,a.y,a.z),t[0]=a.x,t[1]=a.y,t[2]=a.z);else{if(ot(t,a))return;e.uniform3uiv(this.addr,a),st(t,a)}}function Fc(e,a){const t=this.cache;if(a.x!==void 0)(t[0]!==a.x||t[1]!==a.y||t[2]!==a.z||t[3]!==a.w)&&(e.uniform4ui(this.addr,a.x,a.y,a.z,a.w),t[0]=a.x,t[1]=a.y,t[2]=a.z,t[3]=a.w);else{if(ot(t,a))return;e.uniform4uiv(this.addr,a),st(t,a)}}function Oc(e,a,t){const r=this.cache,l=t.allocateTextureUnit();r[0]!==l&&(e.uniform1i(this.addr,l),r[0]=l);let n;this.type===e.SAMPLER_2D_SHADOW?(ti.compareFunction=t.isReversedDepthBuffer()?xa:Aa,n=ti):n=Gn,t.setTexture2D(a||n,l)}function Bc(e,a,t){const r=this.cache,l=t.allocateTextureUnit();r[0]!==l&&(e.uniform1i(this.addr,l),r[0]=l),t.setTexture3D(a||Vn,l)}function Gc(e,a,t){const r=this.cache,l=t.allocateTextureUnit();r[0]!==l&&(e.uniform1i(this.addr,l),r[0]=l),t.setTextureCube(a||Wn,l)}function Hc(e,a,t){const r=this.cache,l=t.allocateTextureUnit();r[0]!==l&&(e.uniform1i(this.addr,l),r[0]=l),t.setTexture2DArray(a||Hn,l)}function Vc(e){switch(e){case 5126:return Mc;case 35664:return xc;case 35665:return Ac;case 35666:return Rc;case 35674:return Cc;case 35675:return bc;case 35676:return Pc;case 5124:case 35670:return Dc;case 35667:case 35671:return Uc;case 35668:case 35672:return Lc;case 35669:case 35673:return Nc;case 5125:return wc;case 36294:return Ic;case 36295:return yc;case 36296:return Fc;case 35678:case 36198:case 36298:case 36306:case 35682:return Oc;case 35679:case 36299:case 36307:return Bc;case 35680:case 36300:case 36308:case 36293:return Gc;case 36289:case 36303:case 36311:case 36292:return Hc}}function Wc(e,a){e.uniform1fv(this.addr,a)}function zc(e,a){const t=na(a,this.size,2);e.uniform2fv(this.addr,t)}function kc(e,a){const t=na(a,this.size,3);e.uniform3fv(this.addr,t)}function Xc(e,a){const t=na(a,this.size,4);e.uniform4fv(this.addr,t)}function Yc(e,a){const t=na(a,this.size,4);e.uniformMatrix2fv(this.addr,!1,t)}function qc(e,a){const t=na(a,this.size,9);e.uniformMatrix3fv(this.addr,!1,t)}function jc(e,a){const t=na(a,this.size,16);e.uniformMatrix4fv(this.addr,!1,t)}function Kc(e,a){e.uniform1iv(this.addr,a)}function Zc(e,a){e.uniform2iv(this.addr,a)}function $c(e,a){e.uniform3iv(this.addr,a)}function Qc(e,a){e.uniform4iv(this.addr,a)}function Jc(e,a){e.uniform1uiv(this.addr,a)}function ed(e,a){e.uniform2uiv(this.addr,a)}function td(e,a){e.uniform3uiv(this.addr,a)}function ad(e,a){e.uniform4uiv(this.addr,a)}function rd(e,a,t){const r=this.cache,l=a.length,n=Fa(t,l);ot(r,n)||(e.uniform1iv(this.addr,n),st(r,n));let f;this.type===e.SAMPLER_2D_SHADOW?f=ti:f=Gn;for(let m=0;m!==l;++m)t.setTexture2D(a[m]||f,n[m])}function id(e,a,t){const r=this.cache,l=a.length,n=Fa(t,l);ot(r,n)||(e.uniform1iv(this.addr,n),st(r,n));for(let f=0;f!==l;++f)t.setTexture3D(a[f]||Vn,n[f])}function nd(e,a,t){const r=this.cache,l=a.length,n=Fa(t,l);ot(r,n)||(e.uniform1iv(this.addr,n),st(r,n));for(let f=0;f!==l;++f)t.setTextureCube(a[f]||Wn,n[f])}function od(e,a,t){const r=this.cache,l=a.length,n=Fa(t,l);ot(r,n)||(e.uniform1iv(this.addr,n),st(r,n));for(let f=0;f!==l;++f)t.setTexture2DArray(a[f]||Hn,n[f])}function sd(e){switch(e){case 5126:return Wc;case 35664:return zc;case 35665:return kc;case 35666:return Xc;case 35674:return Yc;case 35675:return qc;case 35676:return jc;case 5124:case 35670:return Kc;case 35667:case 35671:return Zc;case 35668:case 35672:return $c;case 35669:case 35673:return Qc;case 5125:return Jc;case 36294:return ed;case 36295:return td;case 36296:return ad;case 35678:case 36198:case 36298:case 36306:case 35682:return rd;case 35679:case 36299:case 36307:return id;case 35680:case 36300:case 36308:case 36293:return nd;case 36289:case 36303:case 36311:case 36292:return od}}class ld{constructor(a,t,r){this.id=a,this.addr=r,this.cache=[],this.type=t.type,this.setValue=Vc(t.type)}}class cd{constructor(a,t,r){this.id=a,this.addr=r,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=sd(t.type)}}class dd{constructor(a){this.id=a,this.seq=[],this.map={}}setValue(a,t,r){const l=this.seq;for(let n=0,f=l.length;n!==f;++n){const m=l[n];m.setValue(a,t[m.id],r)}}}const ai=/(\w+)(\])?(\[|\.)?/g;function jn(e,a){e.seq.push(a),e.map[a.id]=a}function ud(e,a,t){const r=e.name,l=r.length;for(ai.lastIndex=0;;){const n=ai.exec(r),f=ai.lastIndex;let m=n[1];const N=n[2]==="]",x=n[3];if(N&&(m=m|0),x===void 0||x==="["&&f+2===l){jn(t,x===void 0?new ld(m,e,a):new cd(m,e,a));break}else{let z=t.map[m];z===void 0&&(z=new dd(m),jn(t,z)),t=z}}}class Oa{constructor(a,t){this.seq=[],this.map={};const r=a.getProgramParameter(t,a.ACTIVE_UNIFORMS);for(let f=0;f<r;++f){const m=a.getActiveUniform(t,f),N=a.getUniformLocation(t,m.name);ud(m,N,this)}const l=[],n=[];for(const f of this.seq)f.type===a.SAMPLER_2D_SHADOW||f.type===a.SAMPLER_CUBE_SHADOW||f.type===a.SAMPLER_2D_ARRAY_SHADOW?l.push(f):n.push(f);l.length>0&&(this.seq=l.concat(n))}setValue(a,t,r,l){const n=this.map[t];n!==void 0&&n.setValue(a,r,l)}setOptional(a,t,r){const l=t[r];l!==void 0&&this.setValue(a,r,l)}static upload(a,t,r,l){for(let n=0,f=t.length;n!==f;++n){const m=t[n],N=r[m.id];N.needsUpdate!==!1&&m.setValue(a,N.value,l)}}static seqWithValue(a,t){const r=[];for(let l=0,n=a.length;l!==n;++l){const f=a[l];f.id in t&&r.push(f)}return r}}function Kn(e,a,t){const r=e.createShader(a);return e.shaderSource(r,t),e.compileShader(r),r}const fd=37297;let pd=0;function md(e,a){const t=e.split(`
`),r=[],l=Math.max(a-6,0),n=Math.min(a+6,t.length);for(let f=l;f<n;f++){const m=f+1;r.push(`${m===a?">":" "} ${m}: ${t[f]}`)}return r.join(`
`)}const Zn=new Fe;function hd(e){Qe._getMatrix(Zn,Qe.workingColorSpace,e);const a=`mat3( ${Zn.elements.map(t=>t.toFixed(4))} )`;switch(Qe.getTransfer(e)){case rr:return[a,"LinearTransferOETF"];case ke:return[a,"sRGBTransferOETF"];default:return Be("WebGLProgram: Unsupported color space: ",e),[a,"LinearTransferOETF"]}}function $n(e,a,t){const r=e.getShaderParameter(a,e.COMPILE_STATUS),l=(e.getShaderInfoLog(a)||"").trim();if(r&&l==="")return"";const n=/ERROR: 0:(\d+)/.exec(l);if(n){const f=parseInt(n[1]);return t.toUpperCase()+`

`+l+`

`+md(e.getShaderSource(a),f)}else return l}function _d(e,a){const t=hd(a);return[`vec4 ${e}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const gd={[tr]:"Linear",[er]:"Reinhard",[Ja]:"Cineon",[Qa]:"ACESFilmic",[$a]:"AgX",[Za]:"Neutral",[Ka]:"Custom"};function vd(e,a){const t=gd[a];return t===void 0?(Be("WebGLProgram: Unsupported toneMapping:",a),"vec3 "+e+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+e+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Ba=new Ie;function Ed(){Qe.getLuminanceCoefficients(Ba);const e=Ba.x.toFixed(4),a=Ba.y.toFixed(4),t=Ba.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${a}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Sd(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(_a).join(`
`)}function Td(e){const a=[];for(const t in e){const r=e[t];r!==!1&&a.push("#define "+t+" "+r)}return a.join(`
`)}function Md(e,a){const t={},r=e.getProgramParameter(a,e.ACTIVE_ATTRIBUTES);for(let l=0;l<r;l++){const n=e.getActiveAttrib(a,l),f=n.name;let m=1;n.type===e.FLOAT_MAT2&&(m=2),n.type===e.FLOAT_MAT3&&(m=3),n.type===e.FLOAT_MAT4&&(m=4),t[f]={type:n.type,location:e.getAttribLocation(a,f),locationSize:m}}return t}function _a(e){return e!==""}function Qn(e,a){const t=a.numSpotLightShadows+a.numSpotLightMaps-a.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,a.numDirLights).replace(/NUM_SPOT_LIGHTS/g,a.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,a.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,a.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,a.numPointLights).replace(/NUM_HEMI_LIGHTS/g,a.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,a.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,a.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,a.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,a.numPointLightShadows)}function Jn(e,a){return e.replace(/NUM_CLIPPING_PLANES/g,a.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,a.numClippingPlanes-a.numClipIntersection)}const xd=/^[ \t]*#include +<([\w\d./]+)>/gm;function ri(e){return e.replace(xd,Rd)}const Ad=new Map;function Rd(e,a){let t=be[a];if(t===void 0){const r=Ad.get(a);if(r!==void 0)t=be[r],Be('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',a,r);else throw new Error("Can not resolve #include <"+a+">")}return ri(t)}const Cd=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function eo(e){return e.replace(Cd,bd)}function bd(e,a,t,r){let l="";for(let n=parseInt(a);n<parseInt(t);n++)l+=r.replace(/\[\s*i\s*\]/g,"[ "+n+" ]").replace(/UNROLLED_LOOP_INDEX/g,n);return l}function to(e){let a=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision==="highp"?a+=`
#define HIGH_PRECISION`:e.precision==="mediump"?a+=`
#define MEDIUM_PRECISION`:e.precision==="lowp"&&(a+=`
#define LOW_PRECISION`),a}const Pd={[ua]:"SHADOWMAP_TYPE_PCF",[ta]:"SHADOWMAP_TYPE_VSM"};function Dd(e){return Pd[e.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const Ud={[Jt]:"ENVMAP_TYPE_CUBE",[zt]:"ENVMAP_TYPE_CUBE",[sa]:"ENVMAP_TYPE_CUBE_UV"};function Ld(e){return e.envMap===!1?"ENVMAP_TYPE_CUBE":Ud[e.envMapMode]||"ENVMAP_TYPE_CUBE"}const Nd={[zt]:"ENVMAP_MODE_REFRACTION"};function wd(e){return e.envMap===!1?"ENVMAP_MODE_REFLECTION":Nd[e.envMapMode]||"ENVMAP_MODE_REFLECTION"}const Id={[Ri]:"ENVMAP_BLENDING_MULTIPLY",[Ai]:"ENVMAP_BLENDING_MIX",[xi]:"ENVMAP_BLENDING_ADD"};function yd(e){return e.envMap===!1?"ENVMAP_BLENDING_NONE":Id[e.combine]||"ENVMAP_BLENDING_NONE"}function Fd(e){const a=e.envMapCubeUVHeight;if(a===null)return null;const t=Math.log2(a)-2,r=1/a;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:r,maxMip:t}}function Od(e,a,t,r){const l=e.getContext(),n=t.defines;let f=t.vertexShader,m=t.fragmentShader;const N=Dd(t),x=Ld(t),z=wd(t),F=yd(t),p=Fd(t),T=Sd(t),P=Td(n),H=l.createProgram();let c,s,h=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(c=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,P].filter(_a).join(`
`),c.length>0&&(c+=`
`),s=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,P].filter(_a).join(`
`),s.length>0&&(s+=`
`)):(c=[to(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,P,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+z:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+N:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(_a).join(`
`),s=[to(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,P,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+x:"",t.envMap?"#define "+z:"",t.envMap?"#define "+F:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+N:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Tt?"#define TONE_MAPPING":"",t.toneMapping!==Tt?be.tonemapping_pars_fragment:"",t.toneMapping!==Tt?vd("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",be.colorspace_pars_fragment,_d("linearToOutputTexel",t.outputColorSpace),Ed(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(_a).join(`
`)),f=ri(f),f=Qn(f,t),f=Jn(f,t),m=ri(m),m=Qn(m,t),m=Jn(m,t),f=eo(f),m=eo(m),t.isRawShaderMaterial!==!0&&(h=`#version 300 es
`,c=[T,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+c,s=["#define varying in",t.glslVersion===ar?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===ar?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+s);const D=h+c+f,R=h+s+m,V=Kn(l,l.VERTEX_SHADER,D),v=Kn(l,l.FRAGMENT_SHADER,R);l.attachShader(H,V),l.attachShader(H,v),t.index0AttributeName!==void 0?l.bindAttribLocation(H,0,t.index0AttributeName):t.morphTargets===!0&&l.bindAttribLocation(H,0,"position"),l.linkProgram(H);function L(A){if(e.debug.checkShaderErrors){const I=l.getProgramInfoLog(H)||"",Z=l.getShaderInfoLog(V)||"",q=l.getShaderInfoLog(v)||"",y=I.trim(),G=Z.trim(),B=q.trim();let Q=!0,de=!0;if(l.getProgramParameter(H,l.LINK_STATUS)===!1)if(Q=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(l,H,V,v);else{const fe=$n(l,V,"vertex"),Ae=$n(l,v,"fragment");Xe("THREE.WebGLProgram: Shader Error "+l.getError()+" - VALIDATE_STATUS "+l.getProgramParameter(H,l.VALIDATE_STATUS)+`

Material Name: `+A.name+`
Material Type: `+A.type+`

Program Info Log: `+y+`
`+fe+`
`+Ae)}else y!==""?Be("WebGLProgram: Program Info Log:",y):(G===""||B==="")&&(de=!1);de&&(A.diagnostics={runnable:Q,programLog:y,vertexShader:{log:G,prefix:c},fragmentShader:{log:B,prefix:s}})}l.deleteShader(V),l.deleteShader(v),d=new Oa(l,H),g=Md(l,H)}let d;this.getUniforms=function(){return d===void 0&&L(this),d};let g;this.getAttributes=function(){return g===void 0&&L(this),g};let O=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return O===!1&&(O=l.getProgramParameter(H,fd)),O},this.destroy=function(){r.releaseStatesOfProgram(this),l.deleteProgram(H),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=pd++,this.cacheKey=a,this.usedTimes=1,this.program=H,this.vertexShader=V,this.fragmentShader=v,this}let Bd=0;class Gd{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(a){const t=a.vertexShader,r=a.fragmentShader,l=this._getShaderStage(t),n=this._getShaderStage(r),f=this._getShaderCacheForMaterial(a);return f.has(l)===!1&&(f.add(l),l.usedTimes++),f.has(n)===!1&&(f.add(n),n.usedTimes++),this}remove(a){const t=this.materialCache.get(a);for(const r of t)r.usedTimes--,r.usedTimes===0&&this.shaderCache.delete(r.code);return this.materialCache.delete(a),this}getVertexShaderID(a){return this._getShaderStage(a.vertexShader).id}getFragmentShaderID(a){return this._getShaderStage(a.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(a){const t=this.materialCache;let r=t.get(a);return r===void 0&&(r=new Set,t.set(a,r)),r}_getShaderStage(a){const t=this.shaderCache;let r=t.get(a);return r===void 0&&(r=new Hd(a),t.set(a,r)),r}}class Hd{constructor(a){this.id=Bd++,this.code=a,this.usedTimes=0}}function Vd(e){return e===Xt||e===Ra||e===Ca}function Wd(e,a,t,r,l,n){const f=new Pi,m=new Gd,N=new Set,x=[],z=new Map,F=r.logarithmicDepthBuffer;let p=r.precision;const T={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function P(d){return N.add(d),d===0?"uv":`uv${d}`}function H(d,g,O,A,I,Z){const q=A.fog,y=I.geometry,G=d.isMeshStandardMaterial||d.isMeshLambertMaterial||d.isMeshPhongMaterial?A.environment:null,B=d.isMeshStandardMaterial||d.isMeshLambertMaterial&&!d.envMap||d.isMeshPhongMaterial&&!d.envMap,Q=a.get(d.envMap||G,B),de=Q&&Q.mapping===sa?Q.image.height:null,fe=T[d.type];d.precision!==null&&(p=r.getMaxPrecision(d.precision),p!==d.precision&&Be("WebGLProgram.getParameters:",d.precision,"not supported, using",p,"instead."));const Ae=y.morphAttributes.position||y.morphAttributes.normal||y.morphAttributes.color,De=Ae!==void 0?Ae.length:0;let Ve=0;y.morphAttributes.position!==void 0&&(Ve=1),y.morphAttributes.normal!==void 0&&(Ve=2),y.morphAttributes.color!==void 0&&(Ve=3);let Ye,Ue,X,ie;if(fe){const Me=xt[fe];Ye=Me.vertexShader,Ue=Me.fragmentShader}else Ye=d.vertexShader,Ue=d.fragmentShader,m.update(d),X=m.getVertexShaderID(d),ie=m.getFragmentShaderID(d);const te=e.getRenderTarget(),Te=e.state.buffers.depth.getReversed(),Ce=I.isInstancedMesh===!0,pe=I.isBatchedMesh===!0,Oe=!!d.map,Ge=!!d.matcap,Le=!!Q,ct=!!d.aoMap,lt=!!d.lightMap,dt=!!d.bumpMap,Je=!!d.normalMap,gt=!!d.displacementMap,E=!!d.emissiveMap,nt=!!d.metalnessMap,Ne=!!d.roughnessMap,qe=d.anisotropy>0,oe=d.clearcoat>0,tt=d.dispersion>0,u=d.iridescence>0,i=d.sheen>0,C=d.transmission>0,k=qe&&!!d.anisotropyMap,Y=oe&&!!d.clearcoatMap,ae=oe&&!!d.clearcoatNormalMap,re=oe&&!!d.clearcoatRoughnessMap,S=u&&!!d.iridescenceMap,ee=u&&!!d.iridescenceThicknessMap,se=i&&!!d.sheenColorMap,ue=i&&!!d.sheenRoughnessMap,j=!!d.specularMap,Ee=!!d.specularColorMap,Re=!!d.specularIntensityMap,ye=C&&!!d.transmissionMap,He=C&&!!d.thicknessMap,_=!!d.gradientMap,W=!!d.alphaMap,$=d.alphaTest>0,ge=!!d.alphaHash,le=!!d.extensions;let K=Tt;d.toneMapped&&(te===null||te.isXRRenderTarget===!0)&&(K=e.toneMapping);const ve={shaderID:fe,shaderType:d.type,shaderName:d.name,vertexShader:Ye,fragmentShader:Ue,defines:d.defines,customVertexShaderID:X,customFragmentShaderID:ie,isRawShaderMaterial:d.isRawShaderMaterial===!0,glslVersion:d.glslVersion,precision:p,batching:pe,batchingColor:pe&&I._colorsTexture!==null,instancing:Ce,instancingColor:Ce&&I.instanceColor!==null,instancingMorph:Ce&&I.morphTexture!==null,outputColorSpace:te===null?e.outputColorSpace:te.isXRRenderTarget===!0?te.texture.colorSpace:Qe.workingColorSpace,alphaToCoverage:!!d.alphaToCoverage,map:Oe,matcap:Ge,envMap:Le,envMapMode:Le&&Q.mapping,envMapCubeUVHeight:de,aoMap:ct,lightMap:lt,bumpMap:dt,normalMap:Je,displacementMap:gt,emissiveMap:E,normalMapObjectSpace:Je&&d.normalMapType===bi,normalMapTangentSpace:Je&&d.normalMapType===ir,packedNormalMap:Je&&d.normalMapType===ir&&Vd(d.normalMap.format),metalnessMap:nt,roughnessMap:Ne,anisotropy:qe,anisotropyMap:k,clearcoat:oe,clearcoatMap:Y,clearcoatNormalMap:ae,clearcoatRoughnessMap:re,dispersion:tt,iridescence:u,iridescenceMap:S,iridescenceThicknessMap:ee,sheen:i,sheenColorMap:se,sheenRoughnessMap:ue,specularMap:j,specularColorMap:Ee,specularIntensityMap:Re,transmission:C,transmissionMap:ye,thicknessMap:He,gradientMap:_,opaque:d.transparent===!1&&d.blending===fa&&d.alphaToCoverage===!1,alphaMap:W,alphaTest:$,alphaHash:ge,combine:d.combine,mapUv:Oe&&P(d.map.channel),aoMapUv:ct&&P(d.aoMap.channel),lightMapUv:lt&&P(d.lightMap.channel),bumpMapUv:dt&&P(d.bumpMap.channel),normalMapUv:Je&&P(d.normalMap.channel),displacementMapUv:gt&&P(d.displacementMap.channel),emissiveMapUv:E&&P(d.emissiveMap.channel),metalnessMapUv:nt&&P(d.metalnessMap.channel),roughnessMapUv:Ne&&P(d.roughnessMap.channel),anisotropyMapUv:k&&P(d.anisotropyMap.channel),clearcoatMapUv:Y&&P(d.clearcoatMap.channel),clearcoatNormalMapUv:ae&&P(d.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:re&&P(d.clearcoatRoughnessMap.channel),iridescenceMapUv:S&&P(d.iridescenceMap.channel),iridescenceThicknessMapUv:ee&&P(d.iridescenceThicknessMap.channel),sheenColorMapUv:se&&P(d.sheenColorMap.channel),sheenRoughnessMapUv:ue&&P(d.sheenRoughnessMap.channel),specularMapUv:j&&P(d.specularMap.channel),specularColorMapUv:Ee&&P(d.specularColorMap.channel),specularIntensityMapUv:Re&&P(d.specularIntensityMap.channel),transmissionMapUv:ye&&P(d.transmissionMap.channel),thicknessMapUv:He&&P(d.thicknessMap.channel),alphaMapUv:W&&P(d.alphaMap.channel),vertexTangents:!!y.attributes.tangent&&(Je||qe),vertexNormals:!!y.attributes.normal,vertexColors:d.vertexColors,vertexAlphas:d.vertexColors===!0&&!!y.attributes.color&&y.attributes.color.itemSize===4,pointsUvs:I.isPoints===!0&&!!y.attributes.uv&&(Oe||W),fog:!!q,useFog:d.fog===!0,fogExp2:!!q&&q.isFogExp2,flatShading:d.wireframe===!1&&(d.flatShading===!0||y.attributes.normal===void 0&&Je===!1&&(d.isMeshLambertMaterial||d.isMeshPhongMaterial||d.isMeshStandardMaterial||d.isMeshPhysicalMaterial)),sizeAttenuation:d.sizeAttenuation===!0,logarithmicDepthBuffer:F,reversedDepthBuffer:Te,skinning:I.isSkinnedMesh===!0,morphTargets:y.morphAttributes.position!==void 0,morphNormals:y.morphAttributes.normal!==void 0,morphColors:y.morphAttributes.color!==void 0,morphTargetsCount:De,morphTextureStride:Ve,numDirLights:g.directional.length,numPointLights:g.point.length,numSpotLights:g.spot.length,numSpotLightMaps:g.spotLightMap.length,numRectAreaLights:g.rectArea.length,numHemiLights:g.hemi.length,numDirLightShadows:g.directionalShadowMap.length,numPointLightShadows:g.pointShadowMap.length,numSpotLightShadows:g.spotShadowMap.length,numSpotLightShadowsWithMaps:g.numSpotLightShadowsWithMaps,numLightProbes:g.numLightProbes,numLightProbeGrids:Z.length,numClippingPlanes:n.numPlanes,numClipIntersection:n.numIntersection,dithering:d.dithering,shadowMapEnabled:e.shadowMap.enabled&&O.length>0,shadowMapType:e.shadowMap.type,toneMapping:K,decodeVideoTexture:Oe&&d.map.isVideoTexture===!0&&Qe.getTransfer(d.map.colorSpace)===ke,decodeVideoTextureEmissive:E&&d.emissiveMap.isVideoTexture===!0&&Qe.getTransfer(d.emissiveMap.colorSpace)===ke,premultipliedAlpha:d.premultipliedAlpha,doubleSided:d.side===Ut,flipSided:d.side===ht,useDepthPacking:d.depthPacking>=0,depthPacking:d.depthPacking||0,index0AttributeName:d.index0AttributeName,extensionClipCullDistance:le&&d.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(le&&d.extensions.multiDraw===!0||pe)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:d.customProgramCacheKey()};return ve.vertexUv1s=N.has(1),ve.vertexUv2s=N.has(2),ve.vertexUv3s=N.has(3),N.clear(),ve}function c(d){const g=[];if(d.shaderID?g.push(d.shaderID):(g.push(d.customVertexShaderID),g.push(d.customFragmentShaderID)),d.defines!==void 0)for(const O in d.defines)g.push(O),g.push(d.defines[O]);return d.isRawShaderMaterial===!1&&(s(g,d),h(g,d),g.push(e.outputColorSpace)),g.push(d.customProgramCacheKey),g.join()}function s(d,g){d.push(g.precision),d.push(g.outputColorSpace),d.push(g.envMapMode),d.push(g.envMapCubeUVHeight),d.push(g.mapUv),d.push(g.alphaMapUv),d.push(g.lightMapUv),d.push(g.aoMapUv),d.push(g.bumpMapUv),d.push(g.normalMapUv),d.push(g.displacementMapUv),d.push(g.emissiveMapUv),d.push(g.metalnessMapUv),d.push(g.roughnessMapUv),d.push(g.anisotropyMapUv),d.push(g.clearcoatMapUv),d.push(g.clearcoatNormalMapUv),d.push(g.clearcoatRoughnessMapUv),d.push(g.iridescenceMapUv),d.push(g.iridescenceThicknessMapUv),d.push(g.sheenColorMapUv),d.push(g.sheenRoughnessMapUv),d.push(g.specularMapUv),d.push(g.specularColorMapUv),d.push(g.specularIntensityMapUv),d.push(g.transmissionMapUv),d.push(g.thicknessMapUv),d.push(g.combine),d.push(g.fogExp2),d.push(g.sizeAttenuation),d.push(g.morphTargetsCount),d.push(g.morphAttributeCount),d.push(g.numDirLights),d.push(g.numPointLights),d.push(g.numSpotLights),d.push(g.numSpotLightMaps),d.push(g.numHemiLights),d.push(g.numRectAreaLights),d.push(g.numDirLightShadows),d.push(g.numPointLightShadows),d.push(g.numSpotLightShadows),d.push(g.numSpotLightShadowsWithMaps),d.push(g.numLightProbes),d.push(g.shadowMapType),d.push(g.toneMapping),d.push(g.numClippingPlanes),d.push(g.numClipIntersection),d.push(g.depthPacking)}function h(d,g){f.disableAll(),g.instancing&&f.enable(0),g.instancingColor&&f.enable(1),g.instancingMorph&&f.enable(2),g.matcap&&f.enable(3),g.envMap&&f.enable(4),g.normalMapObjectSpace&&f.enable(5),g.normalMapTangentSpace&&f.enable(6),g.clearcoat&&f.enable(7),g.iridescence&&f.enable(8),g.alphaTest&&f.enable(9),g.vertexColors&&f.enable(10),g.vertexAlphas&&f.enable(11),g.vertexUv1s&&f.enable(12),g.vertexUv2s&&f.enable(13),g.vertexUv3s&&f.enable(14),g.vertexTangents&&f.enable(15),g.anisotropy&&f.enable(16),g.alphaHash&&f.enable(17),g.batching&&f.enable(18),g.dispersion&&f.enable(19),g.batchingColor&&f.enable(20),g.gradientMap&&f.enable(21),g.packedNormalMap&&f.enable(22),g.vertexNormals&&f.enable(23),d.push(f.mask),f.disableAll(),g.fog&&f.enable(0),g.useFog&&f.enable(1),g.flatShading&&f.enable(2),g.logarithmicDepthBuffer&&f.enable(3),g.reversedDepthBuffer&&f.enable(4),g.skinning&&f.enable(5),g.morphTargets&&f.enable(6),g.morphNormals&&f.enable(7),g.morphColors&&f.enable(8),g.premultipliedAlpha&&f.enable(9),g.shadowMapEnabled&&f.enable(10),g.doubleSided&&f.enable(11),g.flipSided&&f.enable(12),g.useDepthPacking&&f.enable(13),g.dithering&&f.enable(14),g.transmission&&f.enable(15),g.sheen&&f.enable(16),g.opaque&&f.enable(17),g.pointsUvs&&f.enable(18),g.decodeVideoTexture&&f.enable(19),g.decodeVideoTextureEmissive&&f.enable(20),g.alphaToCoverage&&f.enable(21),g.numLightProbeGrids>0&&f.enable(22),d.push(f.mask)}function D(d){const g=T[d.type];let O;if(g){const A=xt[g];O=Ci.clone(A.uniforms)}else O=d.uniforms;return O}function R(d,g){let O=z.get(g);return O!==void 0?++O.usedTimes:(O=new Od(e,g,d,l),x.push(O),z.set(g,O)),O}function V(d){if(--d.usedTimes===0){const g=x.indexOf(d);x[g]=x[x.length-1],x.pop(),z.delete(d.cacheKey),d.destroy()}}function v(d){m.remove(d)}function L(){m.dispose()}return{getParameters:H,getProgramCacheKey:c,getUniforms:D,acquireProgram:R,releaseProgram:V,releaseShaderCache:v,programs:x,dispose:L}}function zd(){let e=new WeakMap;function a(f){return e.has(f)}function t(f){let m=e.get(f);return m===void 0&&(m={},e.set(f,m)),m}function r(f){e.delete(f)}function l(f,m,N){e.get(f)[m]=N}function n(){e=new WeakMap}return{has:a,get:t,remove:r,update:l,dispose:n}}function kd(e,a){return e.groupOrder!==a.groupOrder?e.groupOrder-a.groupOrder:e.renderOrder!==a.renderOrder?e.renderOrder-a.renderOrder:e.material.id!==a.material.id?e.material.id-a.material.id:e.materialVariant!==a.materialVariant?e.materialVariant-a.materialVariant:e.z!==a.z?e.z-a.z:e.id-a.id}function ao(e,a){return e.groupOrder!==a.groupOrder?e.groupOrder-a.groupOrder:e.renderOrder!==a.renderOrder?e.renderOrder-a.renderOrder:e.z!==a.z?a.z-e.z:e.id-a.id}function ro(){const e=[];let a=0;const t=[],r=[],l=[];function n(){a=0,t.length=0,r.length=0,l.length=0}function f(p){let T=0;return p.isInstancedMesh&&(T+=2),p.isSkinnedMesh&&(T+=1),T}function m(p,T,P,H,c,s){let h=e[a];return h===void 0?(h={id:p.id,object:p,geometry:T,material:P,materialVariant:f(p),groupOrder:H,renderOrder:p.renderOrder,z:c,group:s},e[a]=h):(h.id=p.id,h.object=p,h.geometry=T,h.material=P,h.materialVariant=f(p),h.groupOrder=H,h.renderOrder=p.renderOrder,h.z=c,h.group=s),a++,h}function N(p,T,P,H,c,s){const h=m(p,T,P,H,c,s);P.transmission>0?r.push(h):P.transparent===!0?l.push(h):t.push(h)}function x(p,T,P,H,c,s){const h=m(p,T,P,H,c,s);P.transmission>0?r.unshift(h):P.transparent===!0?l.unshift(h):t.unshift(h)}function z(p,T){t.length>1&&t.sort(p||kd),r.length>1&&r.sort(T||ao),l.length>1&&l.sort(T||ao)}function F(){for(let p=a,T=e.length;p<T;p++){const P=e[p];if(P.id===null)break;P.id=null,P.object=null,P.geometry=null,P.material=null,P.group=null}}return{opaque:t,transmissive:r,transparent:l,init:n,push:N,unshift:x,finish:F,sort:z}}function Xd(){let e=new WeakMap;function a(r,l){const n=e.get(r);let f;return n===void 0?(f=new ro,e.set(r,[f])):l>=n.length?(f=new ro,n.push(f)):f=n[l],f}function t(){e=new WeakMap}return{get:a,dispose:t}}function Yd(){const e={};return{get:function(a){if(e[a.id]!==void 0)return e[a.id];let t;switch(a.type){case"DirectionalLight":t={direction:new Ie,color:new $e};break;case"SpotLight":t={position:new Ie,direction:new Ie,color:new $e,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new Ie,color:new $e,distance:0,decay:0};break;case"HemisphereLight":t={direction:new Ie,skyColor:new $e,groundColor:new $e};break;case"RectAreaLight":t={color:new $e,position:new Ie,halfWidth:new Ie,halfHeight:new Ie};break}return e[a.id]=t,t}}}function qd(){const e={};return{get:function(a){if(e[a.id]!==void 0)return e[a.id];let t;switch(a.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ft};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ft};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ft,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[a.id]=t,t}}}let jd=0;function Kd(e,a){return(a.castShadow?2:0)-(e.castShadow?2:0)+(a.map?1:0)-(e.map?1:0)}function Zd(e){const a=new Yd,t=qd(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let x=0;x<9;x++)r.probe.push(new Ie);const l=new Ie,n=new Wt,f=new Wt;function m(x){let z=0,F=0,p=0;for(let g=0;g<9;g++)r.probe[g].set(0,0,0);let T=0,P=0,H=0,c=0,s=0,h=0,D=0,R=0,V=0,v=0,L=0;x.sort(Kd);for(let g=0,O=x.length;g<O;g++){const A=x[g],I=A.color,Z=A.intensity,q=A.distance;let y=null;if(A.shadow&&A.shadow.map&&(A.shadow.map.texture.format===Xt?y=A.shadow.map.texture:y=A.shadow.map.depthTexture||A.shadow.map.texture),A.isAmbientLight)z+=I.r*Z,F+=I.g*Z,p+=I.b*Z;else if(A.isLightProbe){for(let G=0;G<9;G++)r.probe[G].addScaledVector(A.sh.coefficients[G],Z);L++}else if(A.isDirectionalLight){const G=a.get(A);if(G.color.copy(A.color).multiplyScalar(A.intensity),A.castShadow){const B=A.shadow,Q=t.get(A);Q.shadowIntensity=B.intensity,Q.shadowBias=B.bias,Q.shadowNormalBias=B.normalBias,Q.shadowRadius=B.radius,Q.shadowMapSize=B.mapSize,r.directionalShadow[T]=Q,r.directionalShadowMap[T]=y,r.directionalShadowMatrix[T]=A.shadow.matrix,h++}r.directional[T]=G,T++}else if(A.isSpotLight){const G=a.get(A);G.position.setFromMatrixPosition(A.matrixWorld),G.color.copy(I).multiplyScalar(Z),G.distance=q,G.coneCos=Math.cos(A.angle),G.penumbraCos=Math.cos(A.angle*(1-A.penumbra)),G.decay=A.decay,r.spot[H]=G;const B=A.shadow;if(A.map&&(r.spotLightMap[V]=A.map,V++,B.updateMatrices(A),A.castShadow&&v++),r.spotLightMatrix[H]=B.matrix,A.castShadow){const Q=t.get(A);Q.shadowIntensity=B.intensity,Q.shadowBias=B.bias,Q.shadowNormalBias=B.normalBias,Q.shadowRadius=B.radius,Q.shadowMapSize=B.mapSize,r.spotShadow[H]=Q,r.spotShadowMap[H]=y,R++}H++}else if(A.isRectAreaLight){const G=a.get(A);G.color.copy(I).multiplyScalar(Z),G.halfWidth.set(A.width*.5,0,0),G.halfHeight.set(0,A.height*.5,0),r.rectArea[c]=G,c++}else if(A.isPointLight){const G=a.get(A);if(G.color.copy(A.color).multiplyScalar(A.intensity),G.distance=A.distance,G.decay=A.decay,A.castShadow){const B=A.shadow,Q=t.get(A);Q.shadowIntensity=B.intensity,Q.shadowBias=B.bias,Q.shadowNormalBias=B.normalBias,Q.shadowRadius=B.radius,Q.shadowMapSize=B.mapSize,Q.shadowCameraNear=B.camera.near,Q.shadowCameraFar=B.camera.far,r.pointShadow[P]=Q,r.pointShadowMap[P]=y,r.pointShadowMatrix[P]=A.shadow.matrix,D++}r.point[P]=G,P++}else if(A.isHemisphereLight){const G=a.get(A);G.skyColor.copy(A.color).multiplyScalar(Z),G.groundColor.copy(A.groundColor).multiplyScalar(Z),r.hemi[s]=G,s++}}c>0&&(e.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=ne.LTC_FLOAT_1,r.rectAreaLTC2=ne.LTC_FLOAT_2):(r.rectAreaLTC1=ne.LTC_HALF_1,r.rectAreaLTC2=ne.LTC_HALF_2)),r.ambient[0]=z,r.ambient[1]=F,r.ambient[2]=p;const d=r.hash;(d.directionalLength!==T||d.pointLength!==P||d.spotLength!==H||d.rectAreaLength!==c||d.hemiLength!==s||d.numDirectionalShadows!==h||d.numPointShadows!==D||d.numSpotShadows!==R||d.numSpotMaps!==V||d.numLightProbes!==L)&&(r.directional.length=T,r.spot.length=H,r.rectArea.length=c,r.point.length=P,r.hemi.length=s,r.directionalShadow.length=h,r.directionalShadowMap.length=h,r.pointShadow.length=D,r.pointShadowMap.length=D,r.spotShadow.length=R,r.spotShadowMap.length=R,r.directionalShadowMatrix.length=h,r.pointShadowMatrix.length=D,r.spotLightMatrix.length=R+V-v,r.spotLightMap.length=V,r.numSpotLightShadowsWithMaps=v,r.numLightProbes=L,d.directionalLength=T,d.pointLength=P,d.spotLength=H,d.rectAreaLength=c,d.hemiLength=s,d.numDirectionalShadows=h,d.numPointShadows=D,d.numSpotShadows=R,d.numSpotMaps=V,d.numLightProbes=L,r.version=jd++)}function N(x,z){let F=0,p=0,T=0,P=0,H=0;const c=z.matrixWorldInverse;for(let s=0,h=x.length;s<h;s++){const D=x[s];if(D.isDirectionalLight){const R=r.directional[F];R.direction.setFromMatrixPosition(D.matrixWorld),l.setFromMatrixPosition(D.target.matrixWorld),R.direction.sub(l),R.direction.transformDirection(c),F++}else if(D.isSpotLight){const R=r.spot[T];R.position.setFromMatrixPosition(D.matrixWorld),R.position.applyMatrix4(c),R.direction.setFromMatrixPosition(D.matrixWorld),l.setFromMatrixPosition(D.target.matrixWorld),R.direction.sub(l),R.direction.transformDirection(c),T++}else if(D.isRectAreaLight){const R=r.rectArea[P];R.position.setFromMatrixPosition(D.matrixWorld),R.position.applyMatrix4(c),f.identity(),n.copy(D.matrixWorld),n.premultiply(c),f.extractRotation(n),R.halfWidth.set(D.width*.5,0,0),R.halfHeight.set(0,D.height*.5,0),R.halfWidth.applyMatrix4(f),R.halfHeight.applyMatrix4(f),P++}else if(D.isPointLight){const R=r.point[p];R.position.setFromMatrixPosition(D.matrixWorld),R.position.applyMatrix4(c),p++}else if(D.isHemisphereLight){const R=r.hemi[H];R.direction.setFromMatrixPosition(D.matrixWorld),R.direction.transformDirection(c),H++}}}return{setup:m,setupView:N,state:r}}function io(e){const a=new Zd(e),t=[],r=[],l=[];function n(p){F.camera=p,t.length=0,r.length=0,l.length=0}function f(p){t.push(p)}function m(p){r.push(p)}function N(p){l.push(p)}function x(){a.setup(t)}function z(p){a.setupView(t,p)}const F={lightsArray:t,shadowsArray:r,lightProbeGridArray:l,camera:null,lights:a,transmissionRenderTarget:{},textureUnits:0};return{init:n,state:F,setupLights:x,setupLightsView:z,pushLight:f,pushShadow:m,pushLightProbeGrid:N}}function $d(e){let a=new WeakMap;function t(l,n=0){const f=a.get(l);let m;return f===void 0?(m=new io(e),a.set(l,[m])):n>=f.length?(m=new io(e),f.push(m)):m=f[n],m}function r(){a=new WeakMap}return{get:t,dispose:r}}const Qd=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Jd=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,eu=[new Ie(1,0,0),new Ie(-1,0,0),new Ie(0,1,0),new Ie(0,-1,0),new Ie(0,0,1),new Ie(0,0,-1)],tu=[new Ie(0,-1,0),new Ie(0,-1,0),new Ie(0,0,1),new Ie(0,0,-1),new Ie(0,-1,0),new Ie(0,-1,0)],no=new Wt,ga=new Ie,ii=new Ie;function au(e,a,t){let r=new nr;const l=new ft,n=new ft,f=new pt,m=new Di,N=new Ui,x={},z=t.maxTextureSize,F={[Qt]:ht,[ht]:Qt,[Ut]:Ut},p=new bt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ft},radius:{value:4}},vertexShader:Qd,fragmentShader:Jd}),T=p.clone();T.defines.HORIZONTAL_PASS=1;const P=new la;P.setAttribute("position",new da(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const H=new Ct(P,p),c=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ua;let s=this.type;this.render=function(v,L,d){if(c.enabled===!1||c.autoUpdate===!1&&c.needsUpdate===!1||v.length===0)return;this.type===Li&&(Be("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=ua);const g=e.getRenderTarget(),O=e.getActiveCubeFace(),A=e.getActiveMipmapLevel(),I=e.state;I.setBlending(Dt),I.buffers.depth.getReversed()===!0?I.buffers.color.setClear(0,0,0,0):I.buffers.color.setClear(1,1,1,1),I.buffers.depth.setTest(!0),I.setScissorTest(!1);const Z=s!==this.type;Z&&L.traverse(function(q){q.material&&(Array.isArray(q.material)?q.material.forEach(y=>y.needsUpdate=!0):q.material.needsUpdate=!0)});for(let q=0,y=v.length;q<y;q++){const G=v[q],B=G.shadow;if(B===void 0){Be("WebGLShadowMap:",G,"has no shadow.");continue}if(B.autoUpdate===!1&&B.needsUpdate===!1)continue;l.copy(B.mapSize);const Q=B.getFrameExtents();l.multiply(Q),n.copy(B.mapSize),(l.x>z||l.y>z)&&(l.x>z&&(n.x=Math.floor(z/Q.x),l.x=n.x*Q.x,B.mapSize.x=n.x),l.y>z&&(n.y=Math.floor(z/Q.y),l.y=n.y*Q.y,B.mapSize.y=n.y));const de=e.state.buffers.depth.getReversed();if(B.camera._reversedDepth=de,B.map===null||Z===!0){if(B.map!==null&&(B.map.depthTexture!==null&&(B.map.depthTexture.dispose(),B.map.depthTexture=null),B.map.dispose()),this.type===ta){if(G.isPointLight){Be("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}B.map=new Mt(l.x,l.y,{format:Xt,type:wt,minFilter:_t,magFilter:_t,generateMipmaps:!1}),B.map.texture.name=G.name+".shadowMap",B.map.depthTexture=new ea(l.x,l.y,It),B.map.depthTexture.name=G.name+".shadowMapDepth",B.map.depthTexture.format=Yt,B.map.depthTexture.compareFunction=null,B.map.depthTexture.minFilter=Ot,B.map.depthTexture.magFilter=Ot}else G.isPointLight?(B.map=new ei(l.x),B.map.depthTexture=new Ni(l.x,Bt)):(B.map=new Mt(l.x,l.y),B.map.depthTexture=new ea(l.x,l.y,Bt)),B.map.depthTexture.name=G.name+".shadowMap",B.map.depthTexture.format=Yt,this.type===ua?(B.map.depthTexture.compareFunction=de?xa:Aa,B.map.depthTexture.minFilter=_t,B.map.depthTexture.magFilter=_t):(B.map.depthTexture.compareFunction=null,B.map.depthTexture.minFilter=Ot,B.map.depthTexture.magFilter=Ot);B.camera.updateProjectionMatrix()}const fe=B.map.isWebGLCubeRenderTarget?6:1;for(let Ae=0;Ae<fe;Ae++){if(B.map.isWebGLCubeRenderTarget)e.setRenderTarget(B.map,Ae),e.clear();else{Ae===0&&(e.setRenderTarget(B.map),e.clear());const De=B.getViewport(Ae);f.set(n.x*De.x,n.y*De.y,n.x*De.z,n.y*De.w),I.viewport(f)}if(G.isPointLight){const De=B.camera,Ve=B.matrix,Ye=G.distance||De.far;Ye!==De.far&&(De.far=Ye,De.updateProjectionMatrix()),ga.setFromMatrixPosition(G.matrixWorld),De.position.copy(ga),ii.copy(De.position),ii.add(eu[Ae]),De.up.copy(tu[Ae]),De.lookAt(ii),De.updateMatrixWorld(),Ve.makeTranslation(-ga.x,-ga.y,-ga.z),no.multiplyMatrices(De.projectionMatrix,De.matrixWorldInverse),B._frustum.setFromProjectionMatrix(no,De.coordinateSystem,De.reversedDepth)}else B.updateMatrices(G);r=B.getFrustum(),R(L,d,B.camera,G,this.type)}B.isPointLightShadow!==!0&&this.type===ta&&h(B,d),B.needsUpdate=!1}s=this.type,c.needsUpdate=!1,e.setRenderTarget(g,O,A)};function h(v,L){const d=a.update(H);p.defines.VSM_SAMPLES!==v.blurSamples&&(p.defines.VSM_SAMPLES=v.blurSamples,T.defines.VSM_SAMPLES=v.blurSamples,p.needsUpdate=!0,T.needsUpdate=!0),v.mapPass===null&&(v.mapPass=new Mt(l.x,l.y,{format:Xt,type:wt})),p.uniforms.shadow_pass.value=v.map.depthTexture,p.uniforms.resolution.value=v.mapSize,p.uniforms.radius.value=v.radius,e.setRenderTarget(v.mapPass),e.clear(),e.renderBufferDirect(L,null,d,p,H,null),T.uniforms.shadow_pass.value=v.mapPass.texture,T.uniforms.resolution.value=v.mapSize,T.uniforms.radius.value=v.radius,e.setRenderTarget(v.map),e.clear(),e.renderBufferDirect(L,null,d,T,H,null)}function D(v,L,d,g){let O=null;const A=d.isPointLight===!0?v.customDistanceMaterial:v.customDepthMaterial;if(A!==void 0)O=A;else if(O=d.isPointLight===!0?N:m,e.localClippingEnabled&&L.clipShadows===!0&&Array.isArray(L.clippingPlanes)&&L.clippingPlanes.length!==0||L.displacementMap&&L.displacementScale!==0||L.alphaMap&&L.alphaTest>0||L.map&&L.alphaTest>0||L.alphaToCoverage===!0){const I=O.uuid,Z=L.uuid;let q=x[I];q===void 0&&(q={},x[I]=q);let y=q[Z];y===void 0&&(y=O.clone(),q[Z]=y,L.addEventListener("dispose",V)),O=y}if(O.visible=L.visible,O.wireframe=L.wireframe,g===ta?O.side=L.shadowSide!==null?L.shadowSide:L.side:O.side=L.shadowSide!==null?L.shadowSide:F[L.side],O.alphaMap=L.alphaMap,O.alphaTest=L.alphaToCoverage===!0?.5:L.alphaTest,O.map=L.map,O.clipShadows=L.clipShadows,O.clippingPlanes=L.clippingPlanes,O.clipIntersection=L.clipIntersection,O.displacementMap=L.displacementMap,O.displacementScale=L.displacementScale,O.displacementBias=L.displacementBias,O.wireframeLinewidth=L.wireframeLinewidth,O.linewidth=L.linewidth,d.isPointLight===!0&&O.isMeshDistanceMaterial===!0){const I=e.properties.get(O);I.light=d}return O}function R(v,L,d,g,O){if(v.visible===!1)return;if(v.layers.test(L.layers)&&(v.isMesh||v.isLine||v.isPoints)&&(v.castShadow||v.receiveShadow&&O===ta)&&(!v.frustumCulled||r.intersectsObject(v))){v.modelViewMatrix.multiplyMatrices(d.matrixWorldInverse,v.matrixWorld);const I=a.update(v),Z=v.material;if(Array.isArray(Z)){const q=I.groups;for(let y=0,G=q.length;y<G;y++){const B=q[y],Q=Z[B.materialIndex];if(Q&&Q.visible){const de=D(v,Q,g,O);v.onBeforeShadow(e,v,L,d,I,de,B),e.renderBufferDirect(d,null,I,de,v,B),v.onAfterShadow(e,v,L,d,I,de,B)}}}else if(Z.visible){const q=D(v,Z,g,O);v.onBeforeShadow(e,v,L,d,I,q,null),e.renderBufferDirect(d,null,I,q,v,null),v.onAfterShadow(e,v,L,d,I,q,null)}}const A=v.children;for(let I=0,Z=A.length;I<Z;I++)R(A[I],L,d,g,O)}function V(v){v.target.removeEventListener("dispose",V);for(const L in x){const d=x[L],g=v.target.uuid;g in d&&(d[g].dispose(),delete d[g])}}}function ru(e,a){function t(){let _=!1;const W=new pt;let $=null;const ge=new pt(0,0,0,0);return{setMask:function(le){$!==le&&!_&&(e.colorMask(le,le,le,le),$=le)},setLocked:function(le){_=le},setClear:function(le,K,ve,Me,ut){ut===!0&&(le*=Me,K*=Me,ve*=Me),W.set(le,K,ve,Me),ge.equals(W)===!1&&(e.clearColor(le,K,ve,Me),ge.copy(W))},reset:function(){_=!1,$=null,ge.set(-1,0,0,0)}}}function r(){let _=!1,W=!1,$=null,ge=null,le=null;return{setReversed:function(K){if(W!==K){const ve=a.get("EXT_clip_control");K?ve.clipControlEXT(ve.LOWER_LEFT_EXT,ve.ZERO_TO_ONE_EXT):ve.clipControlEXT(ve.LOWER_LEFT_EXT,ve.NEGATIVE_ONE_TO_ONE_EXT),W=K;const Me=le;le=null,this.setClear(Me)}},getReversed:function(){return W},setTest:function(K){K?te(e.DEPTH_TEST):Te(e.DEPTH_TEST)},setMask:function(K){$!==K&&!_&&(e.depthMask(K),$=K)},setFunc:function(K){if(W&&(K=go[K]),ge!==K){switch(K){case an:e.depthFunc(e.NEVER);break;case tn:e.depthFunc(e.ALWAYS);break;case en:e.depthFunc(e.LESS);break;case or:e.depthFunc(e.LEQUAL);break;case Ji:e.depthFunc(e.EQUAL);break;case Qi:e.depthFunc(e.GEQUAL);break;case $i:e.depthFunc(e.GREATER);break;case Zi:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}ge=K}},setLocked:function(K){_=K},setClear:function(K){le!==K&&(le=K,W&&(K=1-K),e.clearDepth(K))},reset:function(){_=!1,$=null,ge=null,le=null,W=!1}}}function l(){let _=!1,W=null,$=null,ge=null,le=null,K=null,ve=null,Me=null,ut=null;return{setTest:function(Ze){_||(Ze?te(e.STENCIL_TEST):Te(e.STENCIL_TEST))},setMask:function(Ze){W!==Ze&&!_&&(e.stencilMask(Ze),W=Ze)},setFunc:function(Ze,Nt,At){($!==Ze||ge!==Nt||le!==At)&&(e.stencilFunc(Ze,Nt,At),$=Ze,ge=Nt,le=At)},setOp:function(Ze,Nt,At){(K!==Ze||ve!==Nt||Me!==At)&&(e.stencilOp(Ze,Nt,At),K=Ze,ve=Nt,Me=At)},setLocked:function(Ze){_=Ze},setClear:function(Ze){ut!==Ze&&(e.clearStencil(Ze),ut=Ze)},reset:function(){_=!1,W=null,$=null,ge=null,le=null,K=null,ve=null,Me=null,ut=null}}}const n=new t,f=new r,m=new l,N=new WeakMap,x=new WeakMap;let z={},F={},p={},T=new WeakMap,P=[],H=null,c=!1,s=null,h=null,D=null,R=null,V=null,v=null,L=null,d=new $e(0,0,0),g=0,O=!1,A=null,I=null,Z=null,q=null,y=null;const G=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let B=!1,Q=0;const de=e.getParameter(e.VERSION);de.indexOf("WebGL")!==-1?(Q=parseFloat(/^WebGL (\d)/.exec(de)[1]),B=Q>=1):de.indexOf("OpenGL ES")!==-1&&(Q=parseFloat(/^OpenGL ES (\d)/.exec(de)[1]),B=Q>=2);let fe=null,Ae={};const De=e.getParameter(e.SCISSOR_BOX),Ve=e.getParameter(e.VIEWPORT),Ye=new pt().fromArray(De),Ue=new pt().fromArray(Ve);function X(_,W,$,ge){const le=new Uint8Array(4),K=e.createTexture();e.bindTexture(_,K),e.texParameteri(_,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(_,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let ve=0;ve<$;ve++)_===e.TEXTURE_3D||_===e.TEXTURE_2D_ARRAY?e.texImage3D(W,0,e.RGBA,1,1,ge,0,e.RGBA,e.UNSIGNED_BYTE,le):e.texImage2D(W+ve,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,le);return K}const ie={};ie[e.TEXTURE_2D]=X(e.TEXTURE_2D,e.TEXTURE_2D,1),ie[e.TEXTURE_CUBE_MAP]=X(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ie[e.TEXTURE_2D_ARRAY]=X(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ie[e.TEXTURE_3D]=X(e.TEXTURE_3D,e.TEXTURE_3D,1,1),n.setClear(0,0,0,1),f.setClear(1),m.setClear(0),te(e.DEPTH_TEST),f.setFunc(or),dt(!1),Je(sr),te(e.CULL_FACE),ct(Dt);function te(_){z[_]!==!0&&(e.enable(_),z[_]=!0)}function Te(_){z[_]!==!1&&(e.disable(_),z[_]=!1)}function Ce(_,W){return p[_]!==W?(e.bindFramebuffer(_,W),p[_]=W,_===e.DRAW_FRAMEBUFFER&&(p[e.FRAMEBUFFER]=W),_===e.FRAMEBUFFER&&(p[e.DRAW_FRAMEBUFFER]=W),!0):!1}function pe(_,W){let $=P,ge=!1;if(_){$=T.get(W),$===void 0&&($=[],T.set(W,$));const le=_.textures;if($.length!==le.length||$[0]!==e.COLOR_ATTACHMENT0){for(let K=0,ve=le.length;K<ve;K++)$[K]=e.COLOR_ATTACHMENT0+K;$.length=le.length,ge=!0}}else $[0]!==e.BACK&&($[0]=e.BACK,ge=!0);ge&&e.drawBuffers($)}function Oe(_){return H!==_?(e.useProgram(_),H=_,!0):!1}const Ge={[aa]:e.FUNC_ADD,[Ii]:e.FUNC_SUBTRACT,[wi]:e.FUNC_REVERSE_SUBTRACT};Ge[sn]=e.MIN,Ge[ln]=e.MAX;const Le={[Ki]:e.ZERO,[ji]:e.ONE,[qi]:e.SRC_COLOR,[Yi]:e.SRC_ALPHA,[Xi]:e.SRC_ALPHA_SATURATE,[ki]:e.DST_COLOR,[zi]:e.DST_ALPHA,[Wi]:e.ONE_MINUS_SRC_COLOR,[Vi]:e.ONE_MINUS_SRC_ALPHA,[Hi]:e.ONE_MINUS_DST_COLOR,[Gi]:e.ONE_MINUS_DST_ALPHA,[Bi]:e.CONSTANT_COLOR,[Oi]:e.ONE_MINUS_CONSTANT_COLOR,[Fi]:e.CONSTANT_ALPHA,[yi]:e.ONE_MINUS_CONSTANT_ALPHA};function ct(_,W,$,ge,le,K,ve,Me,ut,Ze){if(_===Dt){c===!0&&(Te(e.BLEND),c=!1);return}if(c===!1&&(te(e.BLEND),c=!0),_!==on){if(_!==s||Ze!==O){if((h!==aa||V!==aa)&&(e.blendEquation(e.FUNC_ADD),h=aa,V=aa),Ze)switch(_){case fa:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case dr:e.blendFunc(e.ONE,e.ONE);break;case cr:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case lr:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:Xe("WebGLState: Invalid blending: ",_);break}else switch(_){case fa:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case dr:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case cr:Xe("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case lr:Xe("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Xe("WebGLState: Invalid blending: ",_);break}D=null,R=null,v=null,L=null,d.set(0,0,0),g=0,s=_,O=Ze}return}le=le||W,K=K||$,ve=ve||ge,(W!==h||le!==V)&&(e.blendEquationSeparate(Ge[W],Ge[le]),h=W,V=le),($!==D||ge!==R||K!==v||ve!==L)&&(e.blendFuncSeparate(Le[$],Le[ge],Le[K],Le[ve]),D=$,R=ge,v=K,L=ve),(Me.equals(d)===!1||ut!==g)&&(e.blendColor(Me.r,Me.g,Me.b,ut),d.copy(Me),g=ut),s=_,O=!1}function lt(_,W){_.side===Ut?Te(e.CULL_FACE):te(e.CULL_FACE);let $=_.side===ht;W&&($=!$),dt($),_.blending===fa&&_.transparent===!1?ct(Dt):ct(_.blending,_.blendEquation,_.blendSrc,_.blendDst,_.blendEquationAlpha,_.blendSrcAlpha,_.blendDstAlpha,_.blendColor,_.blendAlpha,_.premultipliedAlpha),f.setFunc(_.depthFunc),f.setTest(_.depthTest),f.setMask(_.depthWrite),n.setMask(_.colorWrite);const ge=_.stencilWrite;m.setTest(ge),ge&&(m.setMask(_.stencilWriteMask),m.setFunc(_.stencilFunc,_.stencilRef,_.stencilFuncMask),m.setOp(_.stencilFail,_.stencilZFail,_.stencilZPass)),E(_.polygonOffset,_.polygonOffsetFactor,_.polygonOffsetUnits),_.alphaToCoverage===!0?te(e.SAMPLE_ALPHA_TO_COVERAGE):Te(e.SAMPLE_ALPHA_TO_COVERAGE)}function dt(_){A!==_&&(_?e.frontFace(e.CW):e.frontFace(e.CCW),A=_)}function Je(_){_!==rn?(te(e.CULL_FACE),_!==I&&(_===sr?e.cullFace(e.BACK):_===nn?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):Te(e.CULL_FACE),I=_}function gt(_){_!==Z&&(B&&e.lineWidth(_),Z=_)}function E(_,W,$){_?(te(e.POLYGON_OFFSET_FILL),(q!==W||y!==$)&&(q=W,y=$,f.getReversed()&&(W=-W),e.polygonOffset(W,$))):Te(e.POLYGON_OFFSET_FILL)}function nt(_){_?te(e.SCISSOR_TEST):Te(e.SCISSOR_TEST)}function Ne(_){_===void 0&&(_=e.TEXTURE0+G-1),fe!==_&&(e.activeTexture(_),fe=_)}function qe(_,W,$){$===void 0&&(fe===null?$=e.TEXTURE0+G-1:$=fe);let ge=Ae[$];ge===void 0&&(ge={type:void 0,texture:void 0},Ae[$]=ge),(ge.type!==_||ge.texture!==W)&&(fe!==$&&(e.activeTexture($),fe=$),e.bindTexture(_,W||ie[_]),ge.type=_,ge.texture=W)}function oe(){const _=Ae[fe];_!==void 0&&_.type!==void 0&&(e.bindTexture(_.type,null),_.type=void 0,_.texture=void 0)}function tt(){try{e.compressedTexImage2D(...arguments)}catch(_){Xe("WebGLState:",_)}}function u(){try{e.compressedTexImage3D(...arguments)}catch(_){Xe("WebGLState:",_)}}function i(){try{e.texSubImage2D(...arguments)}catch(_){Xe("WebGLState:",_)}}function C(){try{e.texSubImage3D(...arguments)}catch(_){Xe("WebGLState:",_)}}function k(){try{e.compressedTexSubImage2D(...arguments)}catch(_){Xe("WebGLState:",_)}}function Y(){try{e.compressedTexSubImage3D(...arguments)}catch(_){Xe("WebGLState:",_)}}function ae(){try{e.texStorage2D(...arguments)}catch(_){Xe("WebGLState:",_)}}function re(){try{e.texStorage3D(...arguments)}catch(_){Xe("WebGLState:",_)}}function S(){try{e.texImage2D(...arguments)}catch(_){Xe("WebGLState:",_)}}function ee(){try{e.texImage3D(...arguments)}catch(_){Xe("WebGLState:",_)}}function se(_){return F[_]!==void 0?F[_]:e.getParameter(_)}function ue(_,W){F[_]!==W&&(e.pixelStorei(_,W),F[_]=W)}function j(_){Ye.equals(_)===!1&&(e.scissor(_.x,_.y,_.z,_.w),Ye.copy(_))}function Ee(_){Ue.equals(_)===!1&&(e.viewport(_.x,_.y,_.z,_.w),Ue.copy(_))}function Re(_,W){let $=x.get(W);$===void 0&&($=new WeakMap,x.set(W,$));let ge=$.get(_);ge===void 0&&(ge=e.getUniformBlockIndex(W,_.name),$.set(_,ge))}function ye(_,W){const $=x.get(W).get(_);N.get(W)!==$&&(e.uniformBlockBinding(W,$,_.__bindingPointIndex),N.set(W,$))}function He(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),f.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),z={},F={},fe=null,Ae={},p={},T=new WeakMap,P=[],H=null,c=!1,s=null,h=null,D=null,R=null,V=null,v=null,L=null,d=new $e(0,0,0),g=0,O=!1,A=null,I=null,Z=null,q=null,y=null,Ye.set(0,0,e.canvas.width,e.canvas.height),Ue.set(0,0,e.canvas.width,e.canvas.height),n.reset(),f.reset(),m.reset()}return{buffers:{color:n,depth:f,stencil:m},enable:te,disable:Te,bindFramebuffer:Ce,drawBuffers:pe,useProgram:Oe,setBlending:ct,setMaterial:lt,setFlipSided:dt,setCullFace:Je,setLineWidth:gt,setPolygonOffset:E,setScissorTest:nt,activeTexture:Ne,bindTexture:qe,unbindTexture:oe,compressedTexImage2D:tt,compressedTexImage3D:u,texImage2D:S,texImage3D:ee,pixelStorei:ue,getParameter:se,updateUBOMapping:Re,uniformBlockBinding:ye,texStorage2D:ae,texStorage3D:re,texSubImage2D:i,texSubImage3D:C,compressedTexSubImage2D:k,compressedTexSubImage3D:Y,scissor:j,viewport:Ee,reset:He}}function iu(e,a,t,r,l,n,f){const m=a.has("WEBGL_multisampled_render_to_texture")?a.get("WEBGL_multisampled_render_to_texture"):null,N=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),x=new ft,z=new WeakMap,F=new Set;let p;const T=new WeakMap;let P=!1;try{P=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function H(u,i){return P?new OffscreenCanvas(u,i):vo("canvas")}function c(u,i,C){let k=1;const Y=tt(u);if((Y.width>C||Y.height>C)&&(k=C/Math.max(Y.width,Y.height)),k<1)if(typeof HTMLImageElement<"u"&&u instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&u instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&u instanceof ImageBitmap||typeof VideoFrame<"u"&&u instanceof VideoFrame){const ae=Math.floor(k*Y.width),re=Math.floor(k*Y.height);p===void 0&&(p=H(ae,re));const S=i?H(ae,re):p;return S.width=ae,S.height=re,S.getContext("2d").drawImage(u,0,0,ae,re),Be("WebGLRenderer: Texture has been resized from ("+Y.width+"x"+Y.height+") to ("+ae+"x"+re+")."),S}else return"data"in u&&Be("WebGLRenderer: Image in DataTexture is too big ("+Y.width+"x"+Y.height+")."),u;return u}function s(u){return u.generateMipmaps}function h(u){e.generateMipmap(u)}function D(u){return u.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:u.isWebGL3DRenderTarget?e.TEXTURE_3D:u.isWebGLArrayRenderTarget||u.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function R(u,i,C,k,Y,ae=!1){if(u!==null){if(e[u]!==void 0)return e[u];Be("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+u+"'")}let re;k&&(re=a.get("EXT_texture_norm16"),re||Be("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let S=i;if(i===e.RED&&(C===e.FLOAT&&(S=e.R32F),C===e.HALF_FLOAT&&(S=e.R16F),C===e.UNSIGNED_BYTE&&(S=e.R8),C===e.UNSIGNED_SHORT&&re&&(S=re.R16_EXT),C===e.SHORT&&re&&(S=re.R16_SNORM_EXT)),i===e.RED_INTEGER&&(C===e.UNSIGNED_BYTE&&(S=e.R8UI),C===e.UNSIGNED_SHORT&&(S=e.R16UI),C===e.UNSIGNED_INT&&(S=e.R32UI),C===e.BYTE&&(S=e.R8I),C===e.SHORT&&(S=e.R16I),C===e.INT&&(S=e.R32I)),i===e.RG&&(C===e.FLOAT&&(S=e.RG32F),C===e.HALF_FLOAT&&(S=e.RG16F),C===e.UNSIGNED_BYTE&&(S=e.RG8),C===e.UNSIGNED_SHORT&&re&&(S=re.RG16_EXT),C===e.SHORT&&re&&(S=re.RG16_SNORM_EXT)),i===e.RG_INTEGER&&(C===e.UNSIGNED_BYTE&&(S=e.RG8UI),C===e.UNSIGNED_SHORT&&(S=e.RG16UI),C===e.UNSIGNED_INT&&(S=e.RG32UI),C===e.BYTE&&(S=e.RG8I),C===e.SHORT&&(S=e.RG16I),C===e.INT&&(S=e.RG32I)),i===e.RGB_INTEGER&&(C===e.UNSIGNED_BYTE&&(S=e.RGB8UI),C===e.UNSIGNED_SHORT&&(S=e.RGB16UI),C===e.UNSIGNED_INT&&(S=e.RGB32UI),C===e.BYTE&&(S=e.RGB8I),C===e.SHORT&&(S=e.RGB16I),C===e.INT&&(S=e.RGB32I)),i===e.RGBA_INTEGER&&(C===e.UNSIGNED_BYTE&&(S=e.RGBA8UI),C===e.UNSIGNED_SHORT&&(S=e.RGBA16UI),C===e.UNSIGNED_INT&&(S=e.RGBA32UI),C===e.BYTE&&(S=e.RGBA8I),C===e.SHORT&&(S=e.RGBA16I),C===e.INT&&(S=e.RGBA32I)),i===e.RGB&&(C===e.UNSIGNED_SHORT&&re&&(S=re.RGB16_EXT),C===e.SHORT&&re&&(S=re.RGB16_SNORM_EXT),C===e.UNSIGNED_INT_5_9_9_9_REV&&(S=e.RGB9_E5),C===e.UNSIGNED_INT_10F_11F_11F_REV&&(S=e.R11F_G11F_B10F)),i===e.RGBA){const ee=ae?rr:Qe.getTransfer(Y);C===e.FLOAT&&(S=e.RGBA32F),C===e.HALF_FLOAT&&(S=e.RGBA16F),C===e.UNSIGNED_BYTE&&(S=ee===ke?e.SRGB8_ALPHA8:e.RGBA8),C===e.UNSIGNED_SHORT&&re&&(S=re.RGBA16_EXT),C===e.SHORT&&re&&(S=re.RGBA16_SNORM_EXT),C===e.UNSIGNED_SHORT_4_4_4_4&&(S=e.RGBA4),C===e.UNSIGNED_SHORT_5_5_5_1&&(S=e.RGB5_A1)}return(S===e.R16F||S===e.R32F||S===e.RG16F||S===e.RG32F||S===e.RGBA16F||S===e.RGBA32F)&&a.get("EXT_color_buffer_float"),S}function V(u,i){let C;return u?i===null||i===Bt||i===ra?C=e.DEPTH24_STENCIL8:i===It?C=e.DEPTH32F_STENCIL8:i===ma&&(C=e.DEPTH24_STENCIL8,Be("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):i===null||i===Bt||i===ra?C=e.DEPTH_COMPONENT24:i===It?C=e.DEPTH_COMPONENT32F:i===ma&&(C=e.DEPTH_COMPONENT16),C}function v(u,i){return s(u)===!0||u.isFramebufferTexture&&u.minFilter!==Ot&&u.minFilter!==_t?Math.log2(Math.max(i.width,i.height))+1:u.mipmaps!==void 0&&u.mipmaps.length>0?u.mipmaps.length:u.isCompressedTexture&&Array.isArray(u.image)?i.mipmaps.length:1}function L(u){const i=u.target;i.removeEventListener("dispose",L),g(i),i.isVideoTexture&&z.delete(i),i.isHTMLTexture&&F.delete(i)}function d(u){const i=u.target;i.removeEventListener("dispose",d),A(i)}function g(u){const i=r.get(u);if(i.__webglInit===void 0)return;const C=u.source,k=T.get(C);if(k){const Y=k[i.__cacheKey];Y.usedTimes--,Y.usedTimes===0&&O(u),Object.keys(k).length===0&&T.delete(C)}r.remove(u)}function O(u){const i=r.get(u);e.deleteTexture(i.__webglTexture);const C=u.source,k=T.get(C);delete k[i.__cacheKey],f.memory.textures--}function A(u){const i=r.get(u);if(u.depthTexture&&(u.depthTexture.dispose(),r.remove(u.depthTexture)),u.isWebGLCubeRenderTarget)for(let k=0;k<6;k++){if(Array.isArray(i.__webglFramebuffer[k]))for(let Y=0;Y<i.__webglFramebuffer[k].length;Y++)e.deleteFramebuffer(i.__webglFramebuffer[k][Y]);else e.deleteFramebuffer(i.__webglFramebuffer[k]);i.__webglDepthbuffer&&e.deleteRenderbuffer(i.__webglDepthbuffer[k])}else{if(Array.isArray(i.__webglFramebuffer))for(let k=0;k<i.__webglFramebuffer.length;k++)e.deleteFramebuffer(i.__webglFramebuffer[k]);else e.deleteFramebuffer(i.__webglFramebuffer);if(i.__webglDepthbuffer&&e.deleteRenderbuffer(i.__webglDepthbuffer),i.__webglMultisampledFramebuffer&&e.deleteFramebuffer(i.__webglMultisampledFramebuffer),i.__webglColorRenderbuffer)for(let k=0;k<i.__webglColorRenderbuffer.length;k++)i.__webglColorRenderbuffer[k]&&e.deleteRenderbuffer(i.__webglColorRenderbuffer[k]);i.__webglDepthRenderbuffer&&e.deleteRenderbuffer(i.__webglDepthRenderbuffer)}const C=u.textures;for(let k=0,Y=C.length;k<Y;k++){const ae=r.get(C[k]);ae.__webglTexture&&(e.deleteTexture(ae.__webglTexture),f.memory.textures--),r.remove(C[k])}r.remove(u)}let I=0;function Z(){I=0}function q(){return I}function y(u){I=u}function G(){const u=I;return u>=l.maxTextures&&Be("WebGLTextures: Trying to use "+u+" texture units while this GPU supports only "+l.maxTextures),I+=1,u}function B(u){const i=[];return i.push(u.wrapS),i.push(u.wrapT),i.push(u.wrapR||0),i.push(u.magFilter),i.push(u.minFilter),i.push(u.anisotropy),i.push(u.internalFormat),i.push(u.format),i.push(u.type),i.push(u.generateMipmaps),i.push(u.premultiplyAlpha),i.push(u.flipY),i.push(u.unpackAlignment),i.push(u.colorSpace),i.join()}function Q(u,i){const C=r.get(u);if(u.isVideoTexture&&qe(u),u.isRenderTargetTexture===!1&&u.isExternalTexture!==!0&&u.version>0&&C.__version!==u.version){const k=u.image;if(k===null)Be("WebGLRenderer: Texture marked for update but no image data found.");else if(k.complete===!1)Be("WebGLRenderer: Texture marked for update but image is incomplete");else{Te(C,u,i);return}}else u.isExternalTexture&&(C.__webglTexture=u.sourceTexture?u.sourceTexture:null);t.bindTexture(e.TEXTURE_2D,C.__webglTexture,e.TEXTURE0+i)}function de(u,i){const C=r.get(u);if(u.isRenderTargetTexture===!1&&u.version>0&&C.__version!==u.version){Te(C,u,i);return}else u.isExternalTexture&&(C.__webglTexture=u.sourceTexture?u.sourceTexture:null);t.bindTexture(e.TEXTURE_2D_ARRAY,C.__webglTexture,e.TEXTURE0+i)}function fe(u,i){const C=r.get(u);if(u.isRenderTargetTexture===!1&&u.version>0&&C.__version!==u.version){Te(C,u,i);return}t.bindTexture(e.TEXTURE_3D,C.__webglTexture,e.TEXTURE0+i)}function Ae(u,i){const C=r.get(u);if(u.isCubeDepthTexture!==!0&&u.version>0&&C.__version!==u.version){Ce(C,u,i);return}t.bindTexture(e.TEXTURE_CUBE_MAP,C.__webglTexture,e.TEXTURE0+i)}const De={[dn]:e.REPEAT,[ba]:e.CLAMP_TO_EDGE,[cn]:e.MIRRORED_REPEAT},Ve={[Ot]:e.NEAREST,[un]:e.NEAREST_MIPMAP_NEAREST,[pa]:e.NEAREST_MIPMAP_LINEAR,[_t]:e.LINEAR,[Pa]:e.LINEAR_MIPMAP_NEAREST,[kt]:e.LINEAR_MIPMAP_LINEAR},Ye={[gn]:e.NEVER,[_n]:e.ALWAYS,[hn]:e.LESS,[Aa]:e.LEQUAL,[mn]:e.EQUAL,[xa]:e.GEQUAL,[pn]:e.GREATER,[fn]:e.NOTEQUAL};function Ue(u,i){if(i.type===It&&a.has("OES_texture_float_linear")===!1&&(i.magFilter===_t||i.magFilter===Pa||i.magFilter===pa||i.magFilter===kt||i.minFilter===_t||i.minFilter===Pa||i.minFilter===pa||i.minFilter===kt)&&Be("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(u,e.TEXTURE_WRAP_S,De[i.wrapS]),e.texParameteri(u,e.TEXTURE_WRAP_T,De[i.wrapT]),(u===e.TEXTURE_3D||u===e.TEXTURE_2D_ARRAY)&&e.texParameteri(u,e.TEXTURE_WRAP_R,De[i.wrapR]),e.texParameteri(u,e.TEXTURE_MAG_FILTER,Ve[i.magFilter]),e.texParameteri(u,e.TEXTURE_MIN_FILTER,Ve[i.minFilter]),i.compareFunction&&(e.texParameteri(u,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(u,e.TEXTURE_COMPARE_FUNC,Ye[i.compareFunction])),a.has("EXT_texture_filter_anisotropic")===!0){if(i.magFilter===Ot||i.minFilter!==pa&&i.minFilter!==kt||i.type===It&&a.has("OES_texture_float_linear")===!1)return;if(i.anisotropy>1||r.get(i).__currentAnisotropy){const C=a.get("EXT_texture_filter_anisotropic");e.texParameterf(u,C.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(i.anisotropy,l.getMaxAnisotropy())),r.get(i).__currentAnisotropy=i.anisotropy}}}function X(u,i){let C=!1;u.__webglInit===void 0&&(u.__webglInit=!0,i.addEventListener("dispose",L));const k=i.source;let Y=T.get(k);Y===void 0&&(Y={},T.set(k,Y));const ae=B(i);if(ae!==u.__cacheKey){Y[ae]===void 0&&(Y[ae]={texture:e.createTexture(),usedTimes:0},f.memory.textures++,C=!0),Y[ae].usedTimes++;const re=Y[u.__cacheKey];re!==void 0&&(Y[u.__cacheKey].usedTimes--,re.usedTimes===0&&O(i)),u.__cacheKey=ae,u.__webglTexture=Y[ae].texture}return C}function ie(u,i,C){return Math.floor(Math.floor(u/C)/i)}function te(u,i,C,k){const Y=u.updateRanges;if(Y.length===0)t.texSubImage2D(e.TEXTURE_2D,0,0,0,i.width,i.height,C,k,i.data);else{Y.sort((se,ue)=>se.start-ue.start);let ae=0;for(let se=1;se<Y.length;se++){const ue=Y[ae],j=Y[se],Ee=ue.start+ue.count,Re=ie(j.start,i.width,4),ye=ie(ue.start,i.width,4);j.start<=Ee+1&&Re===ye&&ie(j.start+j.count-1,i.width,4)===Re?ue.count=Math.max(ue.count,j.start+j.count-ue.start):(++ae,Y[ae]=j)}Y.length=ae+1;const re=t.getParameter(e.UNPACK_ROW_LENGTH),S=t.getParameter(e.UNPACK_SKIP_PIXELS),ee=t.getParameter(e.UNPACK_SKIP_ROWS);t.pixelStorei(e.UNPACK_ROW_LENGTH,i.width);for(let se=0,ue=Y.length;se<ue;se++){const j=Y[se],Ee=Math.floor(j.start/4),Re=Math.ceil(j.count/4),ye=Ee%i.width,He=Math.floor(Ee/i.width),_=Re;t.pixelStorei(e.UNPACK_SKIP_PIXELS,ye),t.pixelStorei(e.UNPACK_SKIP_ROWS,He),t.texSubImage2D(e.TEXTURE_2D,0,ye,He,_,1,C,k,i.data)}u.clearUpdateRanges(),t.pixelStorei(e.UNPACK_ROW_LENGTH,re),t.pixelStorei(e.UNPACK_SKIP_PIXELS,S),t.pixelStorei(e.UNPACK_SKIP_ROWS,ee)}}function Te(u,i,C){let k=e.TEXTURE_2D;(i.isDataArrayTexture||i.isCompressedArrayTexture)&&(k=e.TEXTURE_2D_ARRAY),i.isData3DTexture&&(k=e.TEXTURE_3D);const Y=X(u,i),ae=i.source;t.bindTexture(k,u.__webglTexture,e.TEXTURE0+C);const re=r.get(ae);if(ae.version!==re.__version||Y===!0){if(t.activeTexture(e.TEXTURE0+C),!(typeof ImageBitmap<"u"&&i.image instanceof ImageBitmap)){const W=Qe.getPrimaries(Qe.workingColorSpace),$=i.colorSpace===qt?null:Qe.getPrimaries(i.colorSpace),ge=i.colorSpace===qt||W===$?e.NONE:e.BROWSER_DEFAULT_WEBGL;t.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,i.flipY),t.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,i.premultiplyAlpha),t.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,ge)}t.pixelStorei(e.UNPACK_ALIGNMENT,i.unpackAlignment);let S=c(i.image,!1,l.maxTextureSize);S=oe(i,S);const ee=n.convert(i.format,i.colorSpace),se=n.convert(i.type);let ue=R(i.internalFormat,ee,se,i.normalized,i.colorSpace,i.isVideoTexture);Ue(k,i);let j;const Ee=i.mipmaps,Re=i.isVideoTexture!==!0,ye=re.__version===void 0||Y===!0,He=ae.dataReady,_=v(i,S);if(i.isDepthTexture)ue=V(i.format===jt,i.type),ye&&(Re?t.texStorage2D(e.TEXTURE_2D,1,ue,S.width,S.height):t.texImage2D(e.TEXTURE_2D,0,ue,S.width,S.height,0,ee,se,null));else if(i.isDataTexture)if(Ee.length>0){Re&&ye&&t.texStorage2D(e.TEXTURE_2D,_,ue,Ee[0].width,Ee[0].height);for(let W=0,$=Ee.length;W<$;W++)j=Ee[W],Re?He&&t.texSubImage2D(e.TEXTURE_2D,W,0,0,j.width,j.height,ee,se,j.data):t.texImage2D(e.TEXTURE_2D,W,ue,j.width,j.height,0,ee,se,j.data);i.generateMipmaps=!1}else Re?(ye&&t.texStorage2D(e.TEXTURE_2D,_,ue,S.width,S.height),He&&te(i,S,ee,se)):t.texImage2D(e.TEXTURE_2D,0,ue,S.width,S.height,0,ee,se,S.data);else if(i.isCompressedTexture)if(i.isCompressedArrayTexture){Re&&ye&&t.texStorage3D(e.TEXTURE_2D_ARRAY,_,ue,Ee[0].width,Ee[0].height,S.depth);for(let W=0,$=Ee.length;W<$;W++)if(j=Ee[W],i.format!==Pt)if(ee!==null)if(Re){if(He)if(i.layerUpdates.size>0){const ge=vn(j.width,j.height,i.format,i.type);for(const le of i.layerUpdates){const K=j.data.subarray(le*ge/j.data.BYTES_PER_ELEMENT,(le+1)*ge/j.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,W,0,0,le,j.width,j.height,1,ee,K)}i.clearLayerUpdates()}else t.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,W,0,0,0,j.width,j.height,S.depth,ee,j.data)}else t.compressedTexImage3D(e.TEXTURE_2D_ARRAY,W,ue,j.width,j.height,S.depth,0,j.data,0,0);else Be("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Re?He&&t.texSubImage3D(e.TEXTURE_2D_ARRAY,W,0,0,0,j.width,j.height,S.depth,ee,se,j.data):t.texImage3D(e.TEXTURE_2D_ARRAY,W,ue,j.width,j.height,S.depth,0,ee,se,j.data)}else{Re&&ye&&t.texStorage2D(e.TEXTURE_2D,_,ue,Ee[0].width,Ee[0].height);for(let W=0,$=Ee.length;W<$;W++)j=Ee[W],i.format!==Pt?ee!==null?Re?He&&t.compressedTexSubImage2D(e.TEXTURE_2D,W,0,0,j.width,j.height,ee,j.data):t.compressedTexImage2D(e.TEXTURE_2D,W,ue,j.width,j.height,0,j.data):Be("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Re?He&&t.texSubImage2D(e.TEXTURE_2D,W,0,0,j.width,j.height,ee,se,j.data):t.texImage2D(e.TEXTURE_2D,W,ue,j.width,j.height,0,ee,se,j.data)}else if(i.isDataArrayTexture)if(Re){if(ye&&t.texStorage3D(e.TEXTURE_2D_ARRAY,_,ue,S.width,S.height,S.depth),He)if(i.layerUpdates.size>0){const W=vn(S.width,S.height,i.format,i.type);for(const $ of i.layerUpdates){const ge=S.data.subarray($*W/S.data.BYTES_PER_ELEMENT,($+1)*W/S.data.BYTES_PER_ELEMENT);t.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,$,S.width,S.height,1,ee,se,ge)}i.clearLayerUpdates()}else t.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,S.width,S.height,S.depth,ee,se,S.data)}else t.texImage3D(e.TEXTURE_2D_ARRAY,0,ue,S.width,S.height,S.depth,0,ee,se,S.data);else if(i.isData3DTexture)Re?(ye&&t.texStorage3D(e.TEXTURE_3D,_,ue,S.width,S.height,S.depth),He&&t.texSubImage3D(e.TEXTURE_3D,0,0,0,0,S.width,S.height,S.depth,ee,se,S.data)):t.texImage3D(e.TEXTURE_3D,0,ue,S.width,S.height,S.depth,0,ee,se,S.data);else if(i.isFramebufferTexture){if(ye)if(Re)t.texStorage2D(e.TEXTURE_2D,_,ue,S.width,S.height);else{let W=S.width,$=S.height;for(let ge=0;ge<_;ge++)t.texImage2D(e.TEXTURE_2D,ge,ue,W,$,0,ee,se,null),W>>=1,$>>=1}}else if(i.isHTMLTexture){if("texElementImage2D"in e){const W=e.canvas;if(W.hasAttribute("layoutsubtree")||W.setAttribute("layoutsubtree","true"),S.parentNode!==W){W.appendChild(S),F.add(i),W.onpaint=ve=>{const Me=ve.changedElements;for(const ut of F)Me.includes(ut.image)&&(ut.needsUpdate=!0)},W.requestPaint();return}const $=0,ge=e.RGBA,le=e.RGBA,K=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,$,ge,le,K,S),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(Ee.length>0){if(Re&&ye){const W=tt(Ee[0]);t.texStorage2D(e.TEXTURE_2D,_,ue,W.width,W.height)}for(let W=0,$=Ee.length;W<$;W++)j=Ee[W],Re?He&&t.texSubImage2D(e.TEXTURE_2D,W,0,0,ee,se,j):t.texImage2D(e.TEXTURE_2D,W,ue,ee,se,j);i.generateMipmaps=!1}else if(Re){if(ye){const W=tt(S);t.texStorage2D(e.TEXTURE_2D,_,ue,W.width,W.height)}He&&t.texSubImage2D(e.TEXTURE_2D,0,0,0,ee,se,S)}else t.texImage2D(e.TEXTURE_2D,0,ue,ee,se,S);s(i)&&h(k),re.__version=ae.version,i.onUpdate&&i.onUpdate(i)}u.__version=i.version}function Ce(u,i,C){if(i.image.length!==6)return;const k=X(u,i),Y=i.source;t.bindTexture(e.TEXTURE_CUBE_MAP,u.__webglTexture,e.TEXTURE0+C);const ae=r.get(Y);if(Y.version!==ae.__version||k===!0){t.activeTexture(e.TEXTURE0+C);const re=Qe.getPrimaries(Qe.workingColorSpace),S=i.colorSpace===qt?null:Qe.getPrimaries(i.colorSpace),ee=i.colorSpace===qt||re===S?e.NONE:e.BROWSER_DEFAULT_WEBGL;t.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,i.flipY),t.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,i.premultiplyAlpha),t.pixelStorei(e.UNPACK_ALIGNMENT,i.unpackAlignment),t.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,ee);const se=i.isCompressedTexture||i.image[0].isCompressedTexture,ue=i.image[0]&&i.image[0].isDataTexture,j=[];for(let K=0;K<6;K++)!se&&!ue?j[K]=c(i.image[K],!0,l.maxCubemapSize):j[K]=ue?i.image[K].image:i.image[K],j[K]=oe(i,j[K]);const Ee=j[0],Re=n.convert(i.format,i.colorSpace),ye=n.convert(i.type),He=R(i.internalFormat,Re,ye,i.normalized,i.colorSpace),_=i.isVideoTexture!==!0,W=ae.__version===void 0||k===!0,$=Y.dataReady;let ge=v(i,Ee);Ue(e.TEXTURE_CUBE_MAP,i);let le;if(se){_&&W&&t.texStorage2D(e.TEXTURE_CUBE_MAP,ge,He,Ee.width,Ee.height);for(let K=0;K<6;K++){le=j[K].mipmaps;for(let ve=0;ve<le.length;ve++){const Me=le[ve];i.format!==Pt?Re!==null?_?$&&t.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+K,ve,0,0,Me.width,Me.height,Re,Me.data):t.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+K,ve,He,Me.width,Me.height,0,Me.data):Be("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):_?$&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+K,ve,0,0,Me.width,Me.height,Re,ye,Me.data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+K,ve,He,Me.width,Me.height,0,Re,ye,Me.data)}}}else{if(le=i.mipmaps,_&&W){le.length>0&&ge++;const K=tt(j[0]);t.texStorage2D(e.TEXTURE_CUBE_MAP,ge,He,K.width,K.height)}for(let K=0;K<6;K++)if(ue){_?$&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,j[K].width,j[K].height,Re,ye,j[K].data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,He,j[K].width,j[K].height,0,Re,ye,j[K].data);for(let ve=0;ve<le.length;ve++){const Me=le[ve].image[K].image;_?$&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+K,ve+1,0,0,Me.width,Me.height,Re,ye,Me.data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+K,ve+1,He,Me.width,Me.height,0,Re,ye,Me.data)}}else{_?$&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,Re,ye,j[K]):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,He,Re,ye,j[K]);for(let ve=0;ve<le.length;ve++){const Me=le[ve];_?$&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+K,ve+1,0,0,Re,ye,Me.image[K]):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+K,ve+1,He,Re,ye,Me.image[K])}}}s(i)&&h(e.TEXTURE_CUBE_MAP),ae.__version=Y.version,i.onUpdate&&i.onUpdate(i)}u.__version=i.version}function pe(u,i,C,k,Y,ae){const re=n.convert(C.format,C.colorSpace),S=n.convert(C.type),ee=R(C.internalFormat,re,S,C.normalized,C.colorSpace),se=r.get(i),ue=r.get(C);if(ue.__renderTarget=i,!se.__hasExternalTextures){const j=Math.max(1,i.width>>ae),Ee=Math.max(1,i.height>>ae);Y===e.TEXTURE_3D||Y===e.TEXTURE_2D_ARRAY?t.texImage3D(Y,ae,ee,j,Ee,i.depth,0,re,S,null):t.texImage2D(Y,ae,ee,j,Ee,0,re,S,null)}t.bindFramebuffer(e.FRAMEBUFFER,u),Ne(i)?m.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,k,Y,ue.__webglTexture,0,nt(i)):(Y===e.TEXTURE_2D||Y>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&Y<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,k,Y,ue.__webglTexture,ae),t.bindFramebuffer(e.FRAMEBUFFER,null)}function Oe(u,i,C){if(e.bindRenderbuffer(e.RENDERBUFFER,u),i.depthBuffer){const k=i.depthTexture,Y=k&&k.isDepthTexture?k.type:null,ae=V(i.stencilBuffer,Y),re=i.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;Ne(i)?m.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,nt(i),ae,i.width,i.height):C?e.renderbufferStorageMultisample(e.RENDERBUFFER,nt(i),ae,i.width,i.height):e.renderbufferStorage(e.RENDERBUFFER,ae,i.width,i.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,re,e.RENDERBUFFER,u)}else{const k=i.textures;for(let Y=0;Y<k.length;Y++){const ae=k[Y],re=n.convert(ae.format,ae.colorSpace),S=n.convert(ae.type),ee=R(ae.internalFormat,re,S,ae.normalized,ae.colorSpace);Ne(i)?m.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,nt(i),ee,i.width,i.height):C?e.renderbufferStorageMultisample(e.RENDERBUFFER,nt(i),ee,i.width,i.height):e.renderbufferStorage(e.RENDERBUFFER,ee,i.width,i.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Ge(u,i,C){const k=i.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(e.FRAMEBUFFER,u),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const Y=r.get(i.depthTexture);if(Y.__renderTarget=i,(!Y.__webglTexture||i.depthTexture.image.width!==i.width||i.depthTexture.image.height!==i.height)&&(i.depthTexture.image.width=i.width,i.depthTexture.image.height=i.height,i.depthTexture.needsUpdate=!0),k){if(Y.__webglInit===void 0&&(Y.__webglInit=!0,i.depthTexture.addEventListener("dispose",L)),Y.__webglTexture===void 0){Y.__webglTexture=e.createTexture(),t.bindTexture(e.TEXTURE_CUBE_MAP,Y.__webglTexture),Ue(e.TEXTURE_CUBE_MAP,i.depthTexture);const se=n.convert(i.depthTexture.format),ue=n.convert(i.depthTexture.type);let j;i.depthTexture.format===Yt?j=e.DEPTH_COMPONENT24:i.depthTexture.format===jt&&(j=e.DEPTH24_STENCIL8);for(let Ee=0;Ee<6;Ee++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,0,j,i.width,i.height,0,se,ue,null)}}else Q(i.depthTexture,0);const ae=Y.__webglTexture,re=nt(i),S=k?e.TEXTURE_CUBE_MAP_POSITIVE_X+C:e.TEXTURE_2D,ee=i.depthTexture.format===jt?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(i.depthTexture.format===Yt)Ne(i)?m.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,ee,S,ae,0,re):e.framebufferTexture2D(e.FRAMEBUFFER,ee,S,ae,0);else if(i.depthTexture.format===jt)Ne(i)?m.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,ee,S,ae,0,re):e.framebufferTexture2D(e.FRAMEBUFFER,ee,S,ae,0);else throw new Error("Unknown depthTexture format")}function Le(u){const i=r.get(u),C=u.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==u.depthTexture){const k=u.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),k){const Y=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,k.removeEventListener("dispose",Y)};k.addEventListener("dispose",Y),i.__depthDisposeCallback=Y}i.__boundDepthTexture=k}if(u.depthTexture&&!i.__autoAllocateDepthBuffer)if(C)for(let k=0;k<6;k++)Ge(i.__webglFramebuffer[k],u,k);else{const k=u.texture.mipmaps;k&&k.length>0?Ge(i.__webglFramebuffer[0],u,0):Ge(i.__webglFramebuffer,u,0)}else if(C){i.__webglDepthbuffer=[];for(let k=0;k<6;k++)if(t.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[k]),i.__webglDepthbuffer[k]===void 0)i.__webglDepthbuffer[k]=e.createRenderbuffer(),Oe(i.__webglDepthbuffer[k],u,!1);else{const Y=u.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,ae=i.__webglDepthbuffer[k];e.bindRenderbuffer(e.RENDERBUFFER,ae),e.framebufferRenderbuffer(e.FRAMEBUFFER,Y,e.RENDERBUFFER,ae)}}else{const k=u.texture.mipmaps;if(k&&k.length>0?t.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):t.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),Oe(i.__webglDepthbuffer,u,!1);else{const Y=u.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,ae=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,ae),e.framebufferRenderbuffer(e.FRAMEBUFFER,Y,e.RENDERBUFFER,ae)}}t.bindFramebuffer(e.FRAMEBUFFER,null)}function ct(u,i,C){const k=r.get(u);i!==void 0&&pe(k.__webglFramebuffer,u,u.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),C!==void 0&&Le(u)}function lt(u){const i=u.texture,C=r.get(u),k=r.get(i);u.addEventListener("dispose",d);const Y=u.textures,ae=u.isWebGLCubeRenderTarget===!0,re=Y.length>1;if(re||(k.__webglTexture===void 0&&(k.__webglTexture=e.createTexture()),k.__version=i.version,f.memory.textures++),ae){C.__webglFramebuffer=[];for(let S=0;S<6;S++)if(i.mipmaps&&i.mipmaps.length>0){C.__webglFramebuffer[S]=[];for(let ee=0;ee<i.mipmaps.length;ee++)C.__webglFramebuffer[S][ee]=e.createFramebuffer()}else C.__webglFramebuffer[S]=e.createFramebuffer()}else{if(i.mipmaps&&i.mipmaps.length>0){C.__webglFramebuffer=[];for(let S=0;S<i.mipmaps.length;S++)C.__webglFramebuffer[S]=e.createFramebuffer()}else C.__webglFramebuffer=e.createFramebuffer();if(re)for(let S=0,ee=Y.length;S<ee;S++){const se=r.get(Y[S]);se.__webglTexture===void 0&&(se.__webglTexture=e.createTexture(),f.memory.textures++)}if(u.samples>0&&Ne(u)===!1){C.__webglMultisampledFramebuffer=e.createFramebuffer(),C.__webglColorRenderbuffer=[],t.bindFramebuffer(e.FRAMEBUFFER,C.__webglMultisampledFramebuffer);for(let S=0;S<Y.length;S++){const ee=Y[S];C.__webglColorRenderbuffer[S]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,C.__webglColorRenderbuffer[S]);const se=n.convert(ee.format,ee.colorSpace),ue=n.convert(ee.type),j=R(ee.internalFormat,se,ue,ee.normalized,ee.colorSpace,u.isXRRenderTarget===!0),Ee=nt(u);e.renderbufferStorageMultisample(e.RENDERBUFFER,Ee,j,u.width,u.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+S,e.RENDERBUFFER,C.__webglColorRenderbuffer[S])}e.bindRenderbuffer(e.RENDERBUFFER,null),u.depthBuffer&&(C.__webglDepthRenderbuffer=e.createRenderbuffer(),Oe(C.__webglDepthRenderbuffer,u,!0)),t.bindFramebuffer(e.FRAMEBUFFER,null)}}if(ae){t.bindTexture(e.TEXTURE_CUBE_MAP,k.__webglTexture),Ue(e.TEXTURE_CUBE_MAP,i);for(let S=0;S<6;S++)if(i.mipmaps&&i.mipmaps.length>0)for(let ee=0;ee<i.mipmaps.length;ee++)pe(C.__webglFramebuffer[S][ee],u,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+S,ee);else pe(C.__webglFramebuffer[S],u,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+S,0);s(i)&&h(e.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(re){for(let S=0,ee=Y.length;S<ee;S++){const se=Y[S],ue=r.get(se);let j=e.TEXTURE_2D;(u.isWebGL3DRenderTarget||u.isWebGLArrayRenderTarget)&&(j=u.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),t.bindTexture(j,ue.__webglTexture),Ue(j,se),pe(C.__webglFramebuffer,u,se,e.COLOR_ATTACHMENT0+S,j,0),s(se)&&h(j)}t.unbindTexture()}else{let S=e.TEXTURE_2D;if((u.isWebGL3DRenderTarget||u.isWebGLArrayRenderTarget)&&(S=u.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),t.bindTexture(S,k.__webglTexture),Ue(S,i),i.mipmaps&&i.mipmaps.length>0)for(let ee=0;ee<i.mipmaps.length;ee++)pe(C.__webglFramebuffer[ee],u,i,e.COLOR_ATTACHMENT0,S,ee);else pe(C.__webglFramebuffer,u,i,e.COLOR_ATTACHMENT0,S,0);s(i)&&h(S),t.unbindTexture()}u.depthBuffer&&Le(u)}function dt(u){const i=u.textures;for(let C=0,k=i.length;C<k;C++){const Y=i[C];if(s(Y)){const ae=D(u),re=r.get(Y).__webglTexture;t.bindTexture(ae,re),h(ae),t.unbindTexture()}}}const Je=[],gt=[];function E(u){if(u.samples>0){if(Ne(u)===!1){const i=u.textures,C=u.width,k=u.height;let Y=e.COLOR_BUFFER_BIT;const ae=u.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,re=r.get(u),S=i.length>1;if(S)for(let se=0;se<i.length;se++)t.bindFramebuffer(e.FRAMEBUFFER,re.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+se,e.RENDERBUFFER,null),t.bindFramebuffer(e.FRAMEBUFFER,re.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+se,e.TEXTURE_2D,null,0);t.bindFramebuffer(e.READ_FRAMEBUFFER,re.__webglMultisampledFramebuffer);const ee=u.texture.mipmaps;ee&&ee.length>0?t.bindFramebuffer(e.DRAW_FRAMEBUFFER,re.__webglFramebuffer[0]):t.bindFramebuffer(e.DRAW_FRAMEBUFFER,re.__webglFramebuffer);for(let se=0;se<i.length;se++){if(u.resolveDepthBuffer&&(u.depthBuffer&&(Y|=e.DEPTH_BUFFER_BIT),u.stencilBuffer&&u.resolveStencilBuffer&&(Y|=e.STENCIL_BUFFER_BIT)),S){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,re.__webglColorRenderbuffer[se]);const ue=r.get(i[se]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,ue,0)}e.blitFramebuffer(0,0,C,k,0,0,C,k,Y,e.NEAREST),N===!0&&(Je.length=0,gt.length=0,Je.push(e.COLOR_ATTACHMENT0+se),u.depthBuffer&&u.resolveDepthBuffer===!1&&(Je.push(ae),gt.push(ae),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,gt)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Je))}if(t.bindFramebuffer(e.READ_FRAMEBUFFER,null),t.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),S)for(let se=0;se<i.length;se++){t.bindFramebuffer(e.FRAMEBUFFER,re.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+se,e.RENDERBUFFER,re.__webglColorRenderbuffer[se]);const ue=r.get(i[se]).__webglTexture;t.bindFramebuffer(e.FRAMEBUFFER,re.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+se,e.TEXTURE_2D,ue,0)}t.bindFramebuffer(e.DRAW_FRAMEBUFFER,re.__webglMultisampledFramebuffer)}else if(u.depthBuffer&&u.resolveDepthBuffer===!1&&N){const i=u.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[i])}}}function nt(u){return Math.min(l.maxSamples,u.samples)}function Ne(u){const i=r.get(u);return u.samples>0&&a.has("WEBGL_multisampled_render_to_texture")===!0&&i.__useRenderToTexture!==!1}function qe(u){const i=f.render.frame;z.get(u)!==i&&(z.set(u,i),u.update())}function oe(u,i){const C=u.colorSpace,k=u.format,Y=u.type;return u.isCompressedTexture===!0||u.isVideoTexture===!0||C!==Xa&&C!==qt&&(Qe.getTransfer(C)===ke?(k!==Pt||Y!==St)&&Be("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Xe("WebGLTextures: Unsupported texture color space:",C)),i}function tt(u){return typeof HTMLImageElement<"u"&&u instanceof HTMLImageElement?(x.width=u.naturalWidth||u.width,x.height=u.naturalHeight||u.height):typeof VideoFrame<"u"&&u instanceof VideoFrame?(x.width=u.displayWidth,x.height=u.displayHeight):(x.width=u.width,x.height=u.height),x}this.allocateTextureUnit=G,this.resetTextureUnits=Z,this.getTextureUnits=q,this.setTextureUnits=y,this.setTexture2D=Q,this.setTexture2DArray=de,this.setTexture3D=fe,this.setTextureCube=Ae,this.rebindTextures=ct,this.setupRenderTarget=lt,this.updateRenderTargetMipmap=dt,this.updateMultisampleRenderTarget=E,this.setupDepthRenderbuffer=Le,this.setupFrameBufferTexture=pe,this.useMultisampledRTT=Ne,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function oo(e,a){function t(r,l=qt){let n;const f=Qe.getTransfer(l);if(r===St)return e.UNSIGNED_BYTE;if(r===ur)return e.UNSIGNED_SHORT_4_4_4_4;if(r===fr)return e.UNSIGNED_SHORT_5_5_5_1;if(r===En)return e.UNSIGNED_INT_5_9_9_9_REV;if(r===Sn)return e.UNSIGNED_INT_10F_11F_11F_REV;if(r===Tn)return e.BYTE;if(r===Mn)return e.SHORT;if(r===ma)return e.UNSIGNED_SHORT;if(r===za)return e.INT;if(r===Bt)return e.UNSIGNED_INT;if(r===It)return e.FLOAT;if(r===wt)return e.HALF_FLOAT;if(r===xn)return e.ALPHA;if(r===An)return e.RGB;if(r===Pt)return e.RGBA;if(r===Yt)return e.DEPTH_COMPONENT;if(r===jt)return e.DEPTH_STENCIL;if(r===Rn)return e.RED;if(r===pr)return e.RED_INTEGER;if(r===Xt)return e.RG;if(r===mr)return e.RG_INTEGER;if(r===hr)return e.RGBA_INTEGER;if(r===Da||r===Ua||r===La||r===Na)if(f===ke)if(n=a.get("WEBGL_compressed_texture_s3tc_srgb"),n!==null){if(r===Da)return n.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===Ua)return n.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===La)return n.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===Na)return n.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(n=a.get("WEBGL_compressed_texture_s3tc"),n!==null){if(r===Da)return n.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===Ua)return n.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===La)return n.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===Na)return n.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===_r||r===gr||r===vr||r===Er)if(n=a.get("WEBGL_compressed_texture_pvrtc"),n!==null){if(r===_r)return n.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===gr)return n.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===vr)return n.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===Er)return n.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===Sr||r===Tr||r===Mr||r===xr||r===Ar||r===Ra||r===Rr)if(n=a.get("WEBGL_compressed_texture_etc"),n!==null){if(r===Sr||r===Tr)return f===ke?n.COMPRESSED_SRGB8_ETC2:n.COMPRESSED_RGB8_ETC2;if(r===Mr)return f===ke?n.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:n.COMPRESSED_RGBA8_ETC2_EAC;if(r===xr)return n.COMPRESSED_R11_EAC;if(r===Ar)return n.COMPRESSED_SIGNED_R11_EAC;if(r===Ra)return n.COMPRESSED_RG11_EAC;if(r===Rr)return n.COMPRESSED_SIGNED_RG11_EAC}else return null;if(r===Cr||r===br||r===Pr||r===Dr||r===Ur||r===Lr||r===Nr||r===wr||r===Ir||r===yr||r===Fr||r===Or||r===Br||r===Gr)if(n=a.get("WEBGL_compressed_texture_astc"),n!==null){if(r===Cr)return f===ke?n.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:n.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===br)return f===ke?n.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:n.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===Pr)return f===ke?n.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:n.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===Dr)return f===ke?n.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:n.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===Ur)return f===ke?n.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:n.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===Lr)return f===ke?n.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:n.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===Nr)return f===ke?n.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:n.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===wr)return f===ke?n.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:n.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===Ir)return f===ke?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:n.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===yr)return f===ke?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:n.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===Fr)return f===ke?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:n.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===Or)return f===ke?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:n.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===Br)return f===ke?n.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:n.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===Gr)return f===ke?n.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:n.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===Hr||r===Vr||r===Wr)if(n=a.get("EXT_texture_compression_bptc"),n!==null){if(r===Hr)return f===ke?n.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:n.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===Vr)return n.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===Wr)return n.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===zr||r===kr||r===Ca||r===Xr)if(n=a.get("EXT_texture_compression_rgtc"),n!==null){if(r===zr)return n.COMPRESSED_RED_RGTC1_EXT;if(r===kr)return n.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===Ca)return n.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===Xr)return n.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===ra?e.UNSIGNED_INT_24_8:e[r]!==void 0?e[r]:null}return{convert:t}}const nu=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ou=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class su{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(a,t){if(this.texture===null){const r=new Yr(a.texture);(a.depthNear!==t.depthNear||a.depthFar!==t.depthFar)&&(this.depthNear=a.depthNear,this.depthFar=a.depthFar),this.texture=r}}getMesh(a){if(this.texture!==null&&this.mesh===null){const t=a.cameras[0].viewport,r=new bt({vertexShader:nu,fragmentShader:ou,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ct(new Wa(20,20),r)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class lu extends Cn{constructor(a,t){super();const r=this;let l=null,n=1,f=null,m="local-floor",N=1,x=null,z=null,F=null,p=null,T=null,P=null;const H=typeof XRWebGLBinding<"u",c=new su,s={},h=t.getContextAttributes();let D=null,R=null;const V=[],v=[],L=new ft;let d=null;const g=new ca;g.viewport=new pt;const O=new ca;O.viewport=new pt;const A=[g,O],I=new bn;let Z=null,q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let ie=V[X];return ie===void 0&&(ie=new wa,V[X]=ie),ie.getTargetRaySpace()},this.getControllerGrip=function(X){let ie=V[X];return ie===void 0&&(ie=new wa,V[X]=ie),ie.getGripSpace()},this.getHand=function(X){let ie=V[X];return ie===void 0&&(ie=new wa,V[X]=ie),ie.getHandSpace()};function y(X){const ie=v.indexOf(X.inputSource);if(ie===-1)return;const te=V[ie];te!==void 0&&(te.update(X.inputSource,X.frame,x||f),te.dispatchEvent({type:X.type,data:X.inputSource}))}function G(){l.removeEventListener("select",y),l.removeEventListener("selectstart",y),l.removeEventListener("selectend",y),l.removeEventListener("squeeze",y),l.removeEventListener("squeezestart",y),l.removeEventListener("squeezeend",y),l.removeEventListener("end",G),l.removeEventListener("inputsourceschange",B);for(let X=0;X<V.length;X++){const ie=v[X];ie!==null&&(v[X]=null,V[X].disconnect(ie))}Z=null,q=null,c.reset();for(const X in s)delete s[X];a.setRenderTarget(D),T=null,p=null,F=null,l=null,R=null,Ue.stop(),r.isPresenting=!1,a.setPixelRatio(d),a.setSize(L.width,L.height,!1),r.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){n=X,r.isPresenting===!0&&Be("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){m=X,r.isPresenting===!0&&Be("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return x||f},this.setReferenceSpace=function(X){x=X},this.getBaseLayer=function(){return p!==null?p:T},this.getBinding=function(){return F===null&&H&&(F=new XRWebGLBinding(l,t)),F},this.getFrame=function(){return P},this.getSession=function(){return l},this.setSession=async function(X){if(l=X,l!==null){if(D=a.getRenderTarget(),l.addEventListener("select",y),l.addEventListener("selectstart",y),l.addEventListener("selectend",y),l.addEventListener("squeeze",y),l.addEventListener("squeezestart",y),l.addEventListener("squeezeend",y),l.addEventListener("end",G),l.addEventListener("inputsourceschange",B),h.xrCompatible!==!0&&await t.makeXRCompatible(),d=a.getPixelRatio(),a.getSize(L),H&&"createProjectionLayer"in XRWebGLBinding.prototype){let ie=null,te=null,Te=null;h.depth&&(Te=h.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ie=h.stencil?jt:Yt,te=h.stencil?ra:Bt);const Ce={colorFormat:t.RGBA8,depthFormat:Te,scaleFactor:n};F=this.getBinding(),p=F.createProjectionLayer(Ce),l.updateRenderState({layers:[p]}),a.setPixelRatio(1),a.setSize(p.textureWidth,p.textureHeight,!1),R=new Mt(p.textureWidth,p.textureHeight,{format:Pt,type:St,depthTexture:new ea(p.textureWidth,p.textureHeight,te,void 0,void 0,void 0,void 0,void 0,void 0,ie),stencilBuffer:h.stencil,colorSpace:a.outputColorSpace,samples:h.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}else{const ie={antialias:h.antialias,alpha:!0,depth:h.depth,stencil:h.stencil,framebufferScaleFactor:n};T=new XRWebGLLayer(l,t,ie),l.updateRenderState({baseLayer:T}),a.setPixelRatio(1),a.setSize(T.framebufferWidth,T.framebufferHeight,!1),R=new Mt(T.framebufferWidth,T.framebufferHeight,{format:Pt,type:St,colorSpace:a.outputColorSpace,stencilBuffer:h.stencil,resolveDepthBuffer:T.ignoreDepthValues===!1,resolveStencilBuffer:T.ignoreDepthValues===!1})}R.isXRRenderTarget=!0,this.setFoveation(N),x=null,f=await l.requestReferenceSpace(m),Ue.setContext(l),Ue.start(),r.isPresenting=!0,r.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(l!==null)return l.environmentBlendMode},this.getDepthTexture=function(){return c.getDepthTexture()};function B(X){for(let ie=0;ie<X.removed.length;ie++){const te=X.removed[ie],Te=v.indexOf(te);Te>=0&&(v[Te]=null,V[Te].disconnect(te))}for(let ie=0;ie<X.added.length;ie++){const te=X.added[ie];let Te=v.indexOf(te);if(Te===-1){for(let pe=0;pe<V.length;pe++)if(pe>=v.length){v.push(te),Te=pe;break}else if(v[pe]===null){v[pe]=te,Te=pe;break}if(Te===-1)break}const Ce=V[Te];Ce&&Ce.connect(te)}}const Q=new Ie,de=new Ie;function fe(X,ie,te){Q.setFromMatrixPosition(ie.matrixWorld),de.setFromMatrixPosition(te.matrixWorld);const Te=Q.distanceTo(de),Ce=ie.projectionMatrix.elements,pe=te.projectionMatrix.elements,Oe=Ce[14]/(Ce[10]-1),Ge=Ce[14]/(Ce[10]+1),Le=(Ce[9]+1)/Ce[5],ct=(Ce[9]-1)/Ce[5],lt=(Ce[8]-1)/Ce[0],dt=(pe[8]+1)/pe[0],Je=Oe*lt,gt=Oe*dt,E=Te/(-lt+dt),nt=E*-lt;if(ie.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX(nt),X.translateZ(E),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert(),Ce[10]===-1)X.projectionMatrix.copy(ie.projectionMatrix),X.projectionMatrixInverse.copy(ie.projectionMatrixInverse);else{const Ne=Oe+E,qe=Ge+E,oe=Je-nt,tt=gt+(Te-nt),u=Le*Ge/qe*Ne,i=ct*Ge/qe*Ne;X.projectionMatrix.makePerspective(oe,tt,u,i,Ne,qe),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}}function Ae(X,ie){ie===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(ie.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(l===null)return;let ie=X.near,te=X.far;c.texture!==null&&(c.depthNear>0&&(ie=c.depthNear),c.depthFar>0&&(te=c.depthFar)),I.near=O.near=g.near=ie,I.far=O.far=g.far=te,(Z!==I.near||q!==I.far)&&(l.updateRenderState({depthNear:I.near,depthFar:I.far}),Z=I.near,q=I.far),I.layers.mask=X.layers.mask|6,g.layers.mask=I.layers.mask&-5,O.layers.mask=I.layers.mask&-3;const Te=X.parent,Ce=I.cameras;Ae(I,Te);for(let pe=0;pe<Ce.length;pe++)Ae(Ce[pe],Te);Ce.length===2?fe(I,g,O):I.projectionMatrix.copy(g.projectionMatrix),De(X,I,Te)};function De(X,ie,te){te===null?X.matrix.copy(ie.matrixWorld):(X.matrix.copy(te.matrixWorld),X.matrix.invert(),X.matrix.multiply(ie.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(ie.projectionMatrix),X.projectionMatrixInverse.copy(ie.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=Eo*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return I},this.getFoveation=function(){if(!(p===null&&T===null))return N},this.setFoveation=function(X){N=X,p!==null&&(p.fixedFoveation=X),T!==null&&T.fixedFoveation!==void 0&&(T.fixedFoveation=X)},this.hasDepthSensing=function(){return c.texture!==null},this.getDepthSensingMesh=function(){return c.getMesh(I)},this.getCameraTexture=function(X){return s[X]};let Ve=null;function Ye(X,ie){if(z=ie.getViewerPose(x||f),P=ie,z!==null){const te=z.views;T!==null&&(a.setRenderTargetFramebuffer(R,T.framebuffer),a.setRenderTarget(R));let Te=!1;te.length!==I.cameras.length&&(I.cameras.length=0,Te=!0);for(let pe=0;pe<te.length;pe++){const Oe=te[pe];let Ge=null;if(T!==null)Ge=T.getViewport(Oe);else{const ct=F.getViewSubImage(p,Oe);Ge=ct.viewport,pe===0&&(a.setRenderTargetTextures(R,ct.colorTexture,ct.depthStencilTexture),a.setRenderTarget(R))}let Le=A[pe];Le===void 0&&(Le=new ca,Le.layers.enable(pe),Le.viewport=new pt,A[pe]=Le),Le.matrix.fromArray(Oe.transform.matrix),Le.matrix.decompose(Le.position,Le.quaternion,Le.scale),Le.projectionMatrix.fromArray(Oe.projectionMatrix),Le.projectionMatrixInverse.copy(Le.projectionMatrix).invert(),Le.viewport.set(Ge.x,Ge.y,Ge.width,Ge.height),pe===0&&(I.matrix.copy(Le.matrix),I.matrix.decompose(I.position,I.quaternion,I.scale)),Te===!0&&I.cameras.push(Le)}const Ce=l.enabledFeatures;if(Ce&&Ce.includes("depth-sensing")&&l.depthUsage=="gpu-optimized"&&H){F=r.getBinding();const pe=F.getDepthInformation(te[0]);pe&&pe.isValid&&pe.texture&&c.init(pe,l.renderState)}if(Ce&&Ce.includes("camera-access")&&H){a.state.unbindTexture(),F=r.getBinding();for(let pe=0;pe<te.length;pe++){const Oe=te[pe].camera;if(Oe){let Ge=s[Oe];Ge||(Ge=new Yr,s[Oe]=Ge);const Le=F.getCameraImage(Oe);Ge.sourceTexture=Le}}}}for(let te=0;te<V.length;te++){const Te=v[te],Ce=V[te];Te!==null&&Ce!==void 0&&Ce.update(Te,ie,x||f)}Ve&&Ve(X,ie),ie.detectedPlanes&&r.dispatchEvent({type:"planesdetected",data:ie}),P=null}const Ue=new Nn;Ue.setAnimationLoop(Ye),this.setAnimationLoop=function(X){Ve=X},this.dispose=function(){}}}const cu=new Wt,so=new Fe;so.set(-1,0,0,0,1,0,0,0,1);function du(e,a){function t(c,s){c.matrixAutoUpdate===!0&&c.updateMatrix(),s.value.copy(c.matrix)}function r(c,s){s.color.getRGB(c.fogColor.value,pi(e)),s.isFog?(c.fogNear.value=s.near,c.fogFar.value=s.far):s.isFogExp2&&(c.fogDensity.value=s.density)}function l(c,s,h,D,R){s.isNodeMaterial?s.uniformsNeedUpdate=!1:s.isMeshBasicMaterial?n(c,s):s.isMeshLambertMaterial?(n(c,s),s.envMap&&(c.envMapIntensity.value=s.envMapIntensity)):s.isMeshToonMaterial?(n(c,s),F(c,s)):s.isMeshPhongMaterial?(n(c,s),z(c,s),s.envMap&&(c.envMapIntensity.value=s.envMapIntensity)):s.isMeshStandardMaterial?(n(c,s),p(c,s),s.isMeshPhysicalMaterial&&T(c,s,R)):s.isMeshMatcapMaterial?(n(c,s),P(c,s)):s.isMeshDepthMaterial?n(c,s):s.isMeshDistanceMaterial?(n(c,s),H(c,s)):s.isMeshNormalMaterial?n(c,s):s.isLineBasicMaterial?(f(c,s),s.isLineDashedMaterial&&m(c,s)):s.isPointsMaterial?N(c,s,h,D):s.isSpriteMaterial?x(c,s):s.isShadowMaterial?(c.color.value.copy(s.color),c.opacity.value=s.opacity):s.isShaderMaterial&&(s.uniformsNeedUpdate=!1)}function n(c,s){c.opacity.value=s.opacity,s.color&&c.diffuse.value.copy(s.color),s.emissive&&c.emissive.value.copy(s.emissive).multiplyScalar(s.emissiveIntensity),s.map&&(c.map.value=s.map,t(s.map,c.mapTransform)),s.alphaMap&&(c.alphaMap.value=s.alphaMap,t(s.alphaMap,c.alphaMapTransform)),s.bumpMap&&(c.bumpMap.value=s.bumpMap,t(s.bumpMap,c.bumpMapTransform),c.bumpScale.value=s.bumpScale,s.side===ht&&(c.bumpScale.value*=-1)),s.normalMap&&(c.normalMap.value=s.normalMap,t(s.normalMap,c.normalMapTransform),c.normalScale.value.copy(s.normalScale),s.side===ht&&c.normalScale.value.negate()),s.displacementMap&&(c.displacementMap.value=s.displacementMap,t(s.displacementMap,c.displacementMapTransform),c.displacementScale.value=s.displacementScale,c.displacementBias.value=s.displacementBias),s.emissiveMap&&(c.emissiveMap.value=s.emissiveMap,t(s.emissiveMap,c.emissiveMapTransform)),s.specularMap&&(c.specularMap.value=s.specularMap,t(s.specularMap,c.specularMapTransform)),s.alphaTest>0&&(c.alphaTest.value=s.alphaTest);const h=a.get(s),D=h.envMap,R=h.envMapRotation;D&&(c.envMap.value=D,c.envMapRotation.value.setFromMatrix4(cu.makeRotationFromEuler(R)).transpose(),D.isCubeTexture&&D.isRenderTargetTexture===!1&&c.envMapRotation.value.premultiply(so),c.reflectivity.value=s.reflectivity,c.ior.value=s.ior,c.refractionRatio.value=s.refractionRatio),s.lightMap&&(c.lightMap.value=s.lightMap,c.lightMapIntensity.value=s.lightMapIntensity,t(s.lightMap,c.lightMapTransform)),s.aoMap&&(c.aoMap.value=s.aoMap,c.aoMapIntensity.value=s.aoMapIntensity,t(s.aoMap,c.aoMapTransform))}function f(c,s){c.diffuse.value.copy(s.color),c.opacity.value=s.opacity,s.map&&(c.map.value=s.map,t(s.map,c.mapTransform))}function m(c,s){c.dashSize.value=s.dashSize,c.totalSize.value=s.dashSize+s.gapSize,c.scale.value=s.scale}function N(c,s,h,D){c.diffuse.value.copy(s.color),c.opacity.value=s.opacity,c.size.value=s.size*h,c.scale.value=D*.5,s.map&&(c.map.value=s.map,t(s.map,c.uvTransform)),s.alphaMap&&(c.alphaMap.value=s.alphaMap,t(s.alphaMap,c.alphaMapTransform)),s.alphaTest>0&&(c.alphaTest.value=s.alphaTest)}function x(c,s){c.diffuse.value.copy(s.color),c.opacity.value=s.opacity,c.rotation.value=s.rotation,s.map&&(c.map.value=s.map,t(s.map,c.mapTransform)),s.alphaMap&&(c.alphaMap.value=s.alphaMap,t(s.alphaMap,c.alphaMapTransform)),s.alphaTest>0&&(c.alphaTest.value=s.alphaTest)}function z(c,s){c.specular.value.copy(s.specular),c.shininess.value=Math.max(s.shininess,1e-4)}function F(c,s){s.gradientMap&&(c.gradientMap.value=s.gradientMap)}function p(c,s){c.metalness.value=s.metalness,s.metalnessMap&&(c.metalnessMap.value=s.metalnessMap,t(s.metalnessMap,c.metalnessMapTransform)),c.roughness.value=s.roughness,s.roughnessMap&&(c.roughnessMap.value=s.roughnessMap,t(s.roughnessMap,c.roughnessMapTransform)),s.envMap&&(c.envMapIntensity.value=s.envMapIntensity)}function T(c,s,h){c.ior.value=s.ior,s.sheen>0&&(c.sheenColor.value.copy(s.sheenColor).multiplyScalar(s.sheen),c.sheenRoughness.value=s.sheenRoughness,s.sheenColorMap&&(c.sheenColorMap.value=s.sheenColorMap,t(s.sheenColorMap,c.sheenColorMapTransform)),s.sheenRoughnessMap&&(c.sheenRoughnessMap.value=s.sheenRoughnessMap,t(s.sheenRoughnessMap,c.sheenRoughnessMapTransform))),s.clearcoat>0&&(c.clearcoat.value=s.clearcoat,c.clearcoatRoughness.value=s.clearcoatRoughness,s.clearcoatMap&&(c.clearcoatMap.value=s.clearcoatMap,t(s.clearcoatMap,c.clearcoatMapTransform)),s.clearcoatRoughnessMap&&(c.clearcoatRoughnessMap.value=s.clearcoatRoughnessMap,t(s.clearcoatRoughnessMap,c.clearcoatRoughnessMapTransform)),s.clearcoatNormalMap&&(c.clearcoatNormalMap.value=s.clearcoatNormalMap,t(s.clearcoatNormalMap,c.clearcoatNormalMapTransform),c.clearcoatNormalScale.value.copy(s.clearcoatNormalScale),s.side===ht&&c.clearcoatNormalScale.value.negate())),s.dispersion>0&&(c.dispersion.value=s.dispersion),s.iridescence>0&&(c.iridescence.value=s.iridescence,c.iridescenceIOR.value=s.iridescenceIOR,c.iridescenceThicknessMinimum.value=s.iridescenceThicknessRange[0],c.iridescenceThicknessMaximum.value=s.iridescenceThicknessRange[1],s.iridescenceMap&&(c.iridescenceMap.value=s.iridescenceMap,t(s.iridescenceMap,c.iridescenceMapTransform)),s.iridescenceThicknessMap&&(c.iridescenceThicknessMap.value=s.iridescenceThicknessMap,t(s.iridescenceThicknessMap,c.iridescenceThicknessMapTransform))),s.transmission>0&&(c.transmission.value=s.transmission,c.transmissionSamplerMap.value=h.texture,c.transmissionSamplerSize.value.set(h.width,h.height),s.transmissionMap&&(c.transmissionMap.value=s.transmissionMap,t(s.transmissionMap,c.transmissionMapTransform)),c.thickness.value=s.thickness,s.thicknessMap&&(c.thicknessMap.value=s.thicknessMap,t(s.thicknessMap,c.thicknessMapTransform)),c.attenuationDistance.value=s.attenuationDistance,c.attenuationColor.value.copy(s.attenuationColor)),s.anisotropy>0&&(c.anisotropyVector.value.set(s.anisotropy*Math.cos(s.anisotropyRotation),s.anisotropy*Math.sin(s.anisotropyRotation)),s.anisotropyMap&&(c.anisotropyMap.value=s.anisotropyMap,t(s.anisotropyMap,c.anisotropyMapTransform))),c.specularIntensity.value=s.specularIntensity,c.specularColor.value.copy(s.specularColor),s.specularColorMap&&(c.specularColorMap.value=s.specularColorMap,t(s.specularColorMap,c.specularColorMapTransform)),s.specularIntensityMap&&(c.specularIntensityMap.value=s.specularIntensityMap,t(s.specularIntensityMap,c.specularIntensityMapTransform))}function P(c,s){s.matcap&&(c.matcap.value=s.matcap)}function H(c,s){const h=a.get(s).light;c.referencePosition.value.setFromMatrixPosition(h.matrixWorld),c.nearDistance.value=h.shadow.camera.near,c.farDistance.value=h.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:l}}function uu(e,a,t,r){let l={},n={},f=[];const m=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function N(h,D){const R=D.program;r.uniformBlockBinding(h,R)}function x(h,D){let R=l[h.id];R===void 0&&(P(h),R=z(h),l[h.id]=R,h.addEventListener("dispose",c));const V=D.program;r.updateUBOMapping(h,V);const v=a.render.frame;n[h.id]!==v&&(p(h),n[h.id]=v)}function z(h){const D=F();h.__bindingPointIndex=D;const R=e.createBuffer(),V=h.__size,v=h.usage;return e.bindBuffer(e.UNIFORM_BUFFER,R),e.bufferData(e.UNIFORM_BUFFER,V,v),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,D,R),R}function F(){for(let h=0;h<m;h++)if(f.indexOf(h)===-1)return f.push(h),h;return Xe("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(h){const D=l[h.id],R=h.uniforms,V=h.__cache;e.bindBuffer(e.UNIFORM_BUFFER,D);for(let v=0,L=R.length;v<L;v++){const d=Array.isArray(R[v])?R[v]:[R[v]];for(let g=0,O=d.length;g<O;g++){const A=d[g];if(T(A,v,g,V)===!0){const I=A.__offset,Z=Array.isArray(A.value)?A.value:[A.value];let q=0;for(let y=0;y<Z.length;y++){const G=Z[y],B=H(G);typeof G=="number"||typeof G=="boolean"?(A.__data[0]=G,e.bufferSubData(e.UNIFORM_BUFFER,I+q,A.__data)):G.isMatrix3?(A.__data[0]=G.elements[0],A.__data[1]=G.elements[1],A.__data[2]=G.elements[2],A.__data[3]=0,A.__data[4]=G.elements[3],A.__data[5]=G.elements[4],A.__data[6]=G.elements[5],A.__data[7]=0,A.__data[8]=G.elements[6],A.__data[9]=G.elements[7],A.__data[10]=G.elements[8],A.__data[11]=0):ArrayBuffer.isView(G)?A.__data.set(new G.constructor(G.buffer,G.byteOffset,A.__data.length)):(G.toArray(A.__data,q),q+=B.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,I,A.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function T(h,D,R,V){const v=h.value,L=D+"_"+R;if(V[L]===void 0)return typeof v=="number"||typeof v=="boolean"?V[L]=v:ArrayBuffer.isView(v)?V[L]=v.slice():V[L]=v.clone(),!0;{const d=V[L];if(typeof v=="number"||typeof v=="boolean"){if(d!==v)return V[L]=v,!0}else{if(ArrayBuffer.isView(v))return!0;if(d.equals(v)===!1)return d.copy(v),!0}}return!1}function P(h){const D=h.uniforms;let R=0;const V=16;for(let L=0,d=D.length;L<d;L++){const g=Array.isArray(D[L])?D[L]:[D[L]];for(let O=0,A=g.length;O<A;O++){const I=g[O],Z=Array.isArray(I.value)?I.value:[I.value];for(let q=0,y=Z.length;q<y;q++){const G=Z[q],B=H(G),Q=R%V,de=Q%B.boundary,fe=Q+de;R+=de,fe!==0&&V-fe<B.storage&&(R+=V-fe),I.__data=new Float32Array(B.storage/Float32Array.BYTES_PER_ELEMENT),I.__offset=R,R+=B.storage}}}const v=R%V;return v>0&&(R+=V-v),h.__size=R,h.__cache={},this}function H(h){const D={boundary:0,storage:0};return typeof h=="number"||typeof h=="boolean"?(D.boundary=4,D.storage=4):h.isVector2?(D.boundary=8,D.storage=8):h.isVector3||h.isColor?(D.boundary=16,D.storage=12):h.isVector4?(D.boundary=16,D.storage=16):h.isMatrix3?(D.boundary=48,D.storage=48):h.isMatrix4?(D.boundary=64,D.storage=64):h.isTexture?Be("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(h)?(D.boundary=16,D.storage=h.byteLength):Be("WebGLRenderer: Unsupported uniform value type.",h),D}function c(h){const D=h.target;D.removeEventListener("dispose",c);const R=f.indexOf(D.__bindingPointIndex);f.splice(R,1),e.deleteBuffer(l[D.id]),delete l[D.id],delete n[D.id]}function s(){for(const h in l)e.deleteBuffer(l[h]);f=[],l={},n={}}return{bind:N,update:x,dispose:s}}const fu=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Lt=null;function pu(){return Lt===null&&(Lt=new Pn(fu,16,16,Xt,wt),Lt.name="DFG_LUT",Lt.minFilter=_t,Lt.magFilter=_t,Lt.wrapS=ba,Lt.wrapT=ba,Lt.generateMipmaps=!1,Lt.needsUpdate=!0),Lt}class mu{constructor(a={}){const{canvas:t=Dn(),context:r=null,depth:l=!0,stencil:n=!1,alpha:f=!1,antialias:m=!1,premultipliedAlpha:N=!0,preserveDrawingBuffer:x=!1,powerPreference:z="default",failIfMajorPerformanceCaveat:F=!1,reversedDepthBuffer:p=!1,outputBufferType:T=St}=a;this.isWebGLRenderer=!0;let P;if(r!==null){if(typeof WebGLRenderingContext<"u"&&r instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");P=r.getContextAttributes().alpha}else P=f;const H=T,c=new Set([hr,mr,pr]),s=new Set([St,Bt,ma,ra,ur,fr]),h=new Uint32Array(4),D=new Int32Array(4),R=new Ie;let V=null,v=null;const L=[],d=[];let g=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Tt,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const O=this;let A=!1,I=null;this._outputColorSpace=Un;let Z=0,q=0,y=null,G=-1,B=null;const Q=new pt,de=new pt;let fe=null;const Ae=new $e(0);let De=0,Ve=t.width,Ye=t.height,Ue=1,X=null,ie=null;const te=new pt(0,0,Ve,Ye),Te=new pt(0,0,Ve,Ye);let Ce=!1;const pe=new nr;let Oe=!1,Ge=!1;const Le=new Wt,ct=new Ie,lt=new pt,dt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Je=!1;function gt(){return y===null?Ue:1}let E=r;function nt(o,M){return t.getContext(o,M)}try{const o={alpha:!0,depth:l,stencil:n,antialias:m,premultipliedAlpha:N,preserveDrawingBuffer:x,powerPreference:z,failIfMajorPerformanceCaveat:F};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Ln}`),t.addEventListener("webglcontextlost",K,!1),t.addEventListener("webglcontextrestored",ve,!1),t.addEventListener("webglcontextcreationerror",Me,!1),E===null){const M="webgl2";if(E=nt(M,o),E===null)throw nt(M)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(o){throw Xe("WebGLRenderer: "+o.message),o}let Ne,qe,oe,tt,u,i,C,k,Y,ae,re,S,ee,se,ue,j,Ee,Re,ye,He,_,W,$;function ge(){Ne=new mc(E),Ne.init(),_=new oo(E,Ne),qe=new oc(E,Ne,a,_),oe=new ru(E,Ne),qe.reversedDepthBuffer&&p&&oe.buffers.depth.setReversed(!0),tt=new gc(E),u=new zd,i=new iu(E,Ne,oe,u,qe,_,tt),C=new pc(O),k=new To(E),W=new ic(E,k),Y=new hc(E,k,tt,W),ae=new Ec(E,Y,k,W,tt),Re=new vc(E,qe,i),ue=new sc(u),re=new Wd(O,C,Ne,qe,W,ue),S=new du(O,u),ee=new Xd,se=new $d(Ne),Ee=new rc(O,C,oe,ae,P,N),j=new au(O,ae,qe),$=new uu(E,tt,qe,oe),ye=new nc(E,Ne,tt),He=new _c(E,Ne,tt),tt.programs=re.programs,O.capabilities=qe,O.extensions=Ne,O.properties=u,O.renderLists=ee,O.shadowMap=j,O.state=oe,O.info=tt}ge(),H!==St&&(g=new Tc(H,t.width,t.height,l,n));const le=new lu(O,E);this.xr=le,this.getContext=function(){return E},this.getContextAttributes=function(){return E.getContextAttributes()},this.forceContextLoss=function(){const o=Ne.get("WEBGL_lose_context");o&&o.loseContext()},this.forceContextRestore=function(){const o=Ne.get("WEBGL_lose_context");o&&o.restoreContext()},this.getPixelRatio=function(){return Ue},this.setPixelRatio=function(o){o!==void 0&&(Ue=o,this.setSize(Ve,Ye,!1))},this.getSize=function(o){return o.set(Ve,Ye)},this.setSize=function(o,M,w=!0){if(le.isPresenting){Be("WebGLRenderer: Can't change size while VR device is presenting.");return}Ve=o,Ye=M,t.width=Math.floor(o*Ue),t.height=Math.floor(M*Ue),w===!0&&(t.style.width=o+"px",t.style.height=M+"px"),g!==null&&g.setSize(t.width,t.height),this.setViewport(0,0,o,M)},this.getDrawingBufferSize=function(o){return o.set(Ve*Ue,Ye*Ue).floor()},this.setDrawingBufferSize=function(o,M,w){Ve=o,Ye=M,Ue=w,t.width=Math.floor(o*w),t.height=Math.floor(M*w),this.setViewport(0,0,o,M)},this.setEffects=function(o){if(H===St){Xe("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(o){for(let M=0;M<o.length;M++)if(o[M].isOutputPass===!0){Be("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}g.setEffects(o||[])},this.getCurrentViewport=function(o){return o.copy(Q)},this.getViewport=function(o){return o.copy(te)},this.setViewport=function(o,M,w,U){o.isVector4?te.set(o.x,o.y,o.z,o.w):te.set(o,M,w,U),oe.viewport(Q.copy(te).multiplyScalar(Ue).round())},this.getScissor=function(o){return o.copy(Te)},this.setScissor=function(o,M,w,U){o.isVector4?Te.set(o.x,o.y,o.z,o.w):Te.set(o,M,w,U),oe.scissor(de.copy(Te).multiplyScalar(Ue).round())},this.getScissorTest=function(){return Ce},this.setScissorTest=function(o){oe.setScissorTest(Ce=o)},this.setOpaqueSort=function(o){X=o},this.setTransparentSort=function(o){ie=o},this.getClearColor=function(o){return o.copy(Ee.getClearColor())},this.setClearColor=function(){Ee.setClearColor(...arguments)},this.getClearAlpha=function(){return Ee.getClearAlpha()},this.setClearAlpha=function(){Ee.setClearAlpha(...arguments)},this.clear=function(o=!0,M=!0,w=!0){let U=0;if(o){let b=!1;if(y!==null){const J=y.texture.format;b=c.has(J)}if(b){const J=y.texture.type,ce=s.has(J),me=Ee.getClearColor(),he=Ee.getClearAlpha(),xe=me.r,Pe=me.g,we=me.b;ce?(h[0]=xe,h[1]=Pe,h[2]=we,h[3]=he,E.clearBufferuiv(E.COLOR,0,h)):(D[0]=xe,D[1]=Pe,D[2]=we,D[3]=he,E.clearBufferiv(E.COLOR,0,D))}else U|=E.COLOR_BUFFER_BIT}M&&(U|=E.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),w&&(U|=E.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),U!==0&&E.clear(U)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(o){o.setRenderer(this),I=o},this.dispose=function(){t.removeEventListener("webglcontextlost",K,!1),t.removeEventListener("webglcontextrestored",ve,!1),t.removeEventListener("webglcontextcreationerror",Me,!1),Ee.dispose(),ee.dispose(),se.dispose(),u.dispose(),C.dispose(),ae.dispose(),W.dispose(),$.dispose(),re.dispose(),le.dispose(),le.removeEventListener("sessionstart",ni),le.removeEventListener("sessionend",oi),Ht.stop()};function K(o){o.preventDefault(),qr("WebGLRenderer: Context Lost."),A=!0}function ve(){qr("WebGLRenderer: Context Restored."),A=!1;const o=tt.autoReset,M=j.enabled,w=j.autoUpdate,U=j.needsUpdate,b=j.type;ge(),tt.autoReset=o,j.enabled=M,j.autoUpdate=w,j.needsUpdate=U,j.type=b}function Me(o){Xe("WebGLRenderer: A WebGL context could not be created. Reason: ",o.statusMessage)}function ut(o){const M=o.target;M.removeEventListener("dispose",ut),Ze(M)}function Ze(o){Nt(o),u.remove(o)}function Nt(o){const M=u.get(o).programs;M!==void 0&&(M.forEach(function(w){re.releaseProgram(w)}),o.isShaderMaterial&&re.releaseShaderCache(o))}this.renderBufferDirect=function(o,M,w,U,b,J){M===null&&(M=dt);const ce=b.isMesh&&b.matrixWorld.determinant()<0,me=uo(o,M,w,U,b);oe.setMaterial(U,ce);let he=w.index,xe=1;if(U.wireframe===!0){if(he=Y.getWireframeAttribute(w),he===void 0)return;xe=2}const Pe=w.drawRange,we=w.attributes.position;let Se=Pe.start*xe,je=(Pe.start+Pe.count)*xe;J!==null&&(Se=Math.max(Se,J.start*xe),je=Math.min(je,(J.start+J.count)*xe)),he!==null?(Se=Math.max(Se,0),je=Math.min(je,he.count)):we!=null&&(Se=Math.max(Se,0),je=Math.min(je,we.count));const rt=je-Se;if(rt<0||rt===1/0)return;W.setup(b,U,me,w,he);let et,Ke=ye;if(he!==null&&(et=k.get(he),Ke=He,Ke.setIndex(et)),b.isMesh)U.wireframe===!0?(oe.setLineWidth(U.wireframeLinewidth*gt()),Ke.setMode(E.LINES)):Ke.setMode(E.TRIANGLES);else if(b.isLine){let at=U.linewidth;at===void 0&&(at=1),oe.setLineWidth(at*gt()),b.isLineSegments?Ke.setMode(E.LINES):b.isLineLoop?Ke.setMode(E.LINE_LOOP):Ke.setMode(E.LINE_STRIP)}else b.isPoints?Ke.setMode(E.POINTS):b.isSprite&&Ke.setMode(E.TRIANGLES);if(b.isBatchedMesh)if(Ne.get("WEBGL_multi_draw"))Ke.renderMultiDraw(b._multiDrawStarts,b._multiDrawCounts,b._multiDrawCount);else{const at=b._multiDrawStarts,_e=b._multiDrawCounts,vt=b._multiDrawCount,Vt=he?k.get(he).bytesPerElement:1,Et=u.get(U).currentProgram.getUniforms();for(let Rt=0;Rt<vt;Rt++)Et.setValue(E,"_gl_DrawID",Rt),Ke.render(at[Rt]/Vt,_e[Rt])}else if(b.isInstancedMesh)Ke.renderInstances(Se,rt,b.count);else if(w.isInstancedBufferGeometry){const at=w._maxInstanceCount!==void 0?w._maxInstanceCount:1/0,_e=Math.min(w.instanceCount,at);Ke.renderInstances(Se,rt,_e)}else Ke.render(Se,rt)};function At(o,M,w){o.transparent===!0&&o.side===Ut&&o.forceSinglePass===!1?(o.side=ht,o.needsUpdate=!0,Ea(o,M,w),o.side=Qt,o.needsUpdate=!0,Ea(o,M,w),o.side=Ut):Ea(o,M,w)}this.compile=function(o,M,w=null){w===null&&(w=o),v=se.get(w),v.init(M),d.push(v),w.traverseVisible(function(b){b.isLight&&b.layers.test(M.layers)&&(v.pushLight(b),b.castShadow&&v.pushShadow(b))}),o!==w&&o.traverseVisible(function(b){b.isLight&&b.layers.test(M.layers)&&(v.pushLight(b),b.castShadow&&v.pushShadow(b))}),v.setupLights();const U=new Set;return o.traverse(function(b){if(!(b.isMesh||b.isPoints||b.isLine||b.isSprite))return;const J=b.material;if(J)if(Array.isArray(J))for(let ce=0;ce<J.length;ce++){const me=J[ce];At(me,w,b),U.add(me)}else At(J,w,b),U.add(J)}),v=d.pop(),U},this.compileAsync=function(o,M,w=null){const U=this.compile(o,M,w);return new Promise(b=>{function J(){if(U.forEach(function(ce){u.get(ce).currentProgram.isReady()&&U.delete(ce)}),U.size===0){b(o);return}setTimeout(J,10)}Ne.get("KHR_parallel_shader_compile")!==null?J():setTimeout(J,10)})};let Ga=null;function lo(o){Ga&&Ga(o)}function ni(){Ht.stop()}function oi(){Ht.start()}const Ht=new Nn;Ht.setAnimationLoop(lo),typeof self<"u"&&Ht.setContext(self),this.setAnimationLoop=function(o){Ga=o,le.setAnimationLoop(o),o===null?Ht.stop():Ht.start()},le.addEventListener("sessionstart",ni),le.addEventListener("sessionend",oi),this.render=function(o,M){if(M!==void 0&&M.isCamera!==!0){Xe("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(A===!0)return;I!==null&&I.renderStart(o,M);const w=le.enabled===!0&&le.isPresenting===!0,U=g!==null&&(y===null||w)&&g.begin(O,y);if(o.matrixWorldAutoUpdate===!0&&o.updateMatrixWorld(),M.parent===null&&M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),le.enabled===!0&&le.isPresenting===!0&&(g===null||g.isCompositing()===!1)&&(le.cameraAutoUpdate===!0&&le.updateCamera(M),M=le.getCamera()),o.isScene===!0&&o.onBeforeRender(O,o,M,y),v=se.get(o,d.length),v.init(M),v.state.textureUnits=i.getTextureUnits(),d.push(v),Le.multiplyMatrices(M.projectionMatrix,M.matrixWorldInverse),pe.setFromProjectionMatrix(Le,jr,M.reversedDepth),Ge=this.localClippingEnabled,Oe=ue.init(this.clippingPlanes,Ge),V=ee.get(o,L.length),V.init(),L.push(V),le.enabled===!0&&le.isPresenting===!0){const J=O.xr.getDepthSensingMesh();J!==null&&Ha(J,M,-1/0,O.sortObjects)}Ha(o,M,0,O.sortObjects),V.finish(),O.sortObjects===!0&&V.sort(X,ie),Je=le.enabled===!1||le.isPresenting===!1||le.hasDepthSensing()===!1,Je&&Ee.addToRenderList(V,o),this.info.render.frame++,Oe===!0&&ue.beginShadows();const b=v.state.shadowsArray;if(j.render(b,o,M),Oe===!0&&ue.endShadows(),this.info.autoReset===!0&&this.info.reset(),(U&&g.hasRenderPass())===!1){const J=V.opaque,ce=V.transmissive;if(v.setupLights(),M.isArrayCamera){const me=M.cameras;if(ce.length>0)for(let he=0,xe=me.length;he<xe;he++){const Pe=me[he];li(J,ce,o,Pe)}Je&&Ee.render(o);for(let he=0,xe=me.length;he<xe;he++){const Pe=me[he];si(V,o,Pe,Pe.viewport)}}else ce.length>0&&li(J,ce,o,M),Je&&Ee.render(o),si(V,o,M)}y!==null&&q===0&&(i.updateMultisampleRenderTarget(y),i.updateRenderTargetMipmap(y)),U&&g.end(O),o.isScene===!0&&o.onAfterRender(O,o,M),W.resetDefaultState(),G=-1,B=null,d.pop(),d.length>0?(v=d[d.length-1],i.setTextureUnits(v.state.textureUnits),Oe===!0&&ue.setGlobalState(O.clippingPlanes,v.state.camera)):v=null,L.pop(),L.length>0?V=L[L.length-1]:V=null,I!==null&&I.renderEnd()};function Ha(o,M,w,U){if(o.visible===!1)return;if(o.layers.test(M.layers)){if(o.isGroup)w=o.renderOrder;else if(o.isLOD)o.autoUpdate===!0&&o.update(M);else if(o.isLightProbeGrid)v.pushLightProbeGrid(o);else if(o.isLight)v.pushLight(o),o.castShadow&&v.pushShadow(o);else if(o.isSprite){if(!o.frustumCulled||pe.intersectsSprite(o)){U&&lt.setFromMatrixPosition(o.matrixWorld).applyMatrix4(Le);const J=ae.update(o),ce=o.material;ce.visible&&V.push(o,J,ce,w,lt.z,null)}}else if((o.isMesh||o.isLine||o.isPoints)&&(!o.frustumCulled||pe.intersectsObject(o))){const J=ae.update(o),ce=o.material;if(U&&(o.boundingSphere!==void 0?(o.boundingSphere===null&&o.computeBoundingSphere(),lt.copy(o.boundingSphere.center)):(J.boundingSphere===null&&J.computeBoundingSphere(),lt.copy(J.boundingSphere.center)),lt.applyMatrix4(o.matrixWorld).applyMatrix4(Le)),Array.isArray(ce)){const me=J.groups;for(let he=0,xe=me.length;he<xe;he++){const Pe=me[he],we=ce[Pe.materialIndex];we&&we.visible&&V.push(o,J,we,w,lt.z,Pe)}}else ce.visible&&V.push(o,J,ce,w,lt.z,null)}}const b=o.children;for(let J=0,ce=b.length;J<ce;J++)Ha(b[J],M,w,U)}function si(o,M,w,U){const{opaque:b,transmissive:J,transparent:ce}=o;v.setupLightsView(w),Oe===!0&&ue.setGlobalState(O.clippingPlanes,w),U&&oe.viewport(Q.copy(U)),b.length>0&&va(b,M,w),J.length>0&&va(J,M,w),ce.length>0&&va(ce,M,w),oe.buffers.depth.setTest(!0),oe.buffers.depth.setMask(!0),oe.buffers.color.setMask(!0),oe.setPolygonOffset(!1)}function li(o,M,w,U){if((w.isScene===!0?w.overrideMaterial:null)!==null)return;if(v.state.transmissionRenderTarget[U.id]===void 0){const we=Ne.has("EXT_color_buffer_half_float")||Ne.has("EXT_color_buffer_float");v.state.transmissionRenderTarget[U.id]=new Mt(1,1,{generateMipmaps:!0,type:we?wt:St,minFilter:kt,samples:Math.max(4,qe.samples),stencilBuffer:n,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Qe.workingColorSpace})}const b=v.state.transmissionRenderTarget[U.id],J=U.viewport||Q;b.setSize(J.z*O.transmissionResolutionScale,J.w*O.transmissionResolutionScale);const ce=O.getRenderTarget(),me=O.getActiveCubeFace(),he=O.getActiveMipmapLevel();O.setRenderTarget(b),O.getClearColor(Ae),De=O.getClearAlpha(),De<1&&O.setClearColor(16777215,.5),O.clear(),Je&&Ee.render(w);const xe=O.toneMapping;O.toneMapping=Tt;const Pe=U.viewport;if(U.viewport!==void 0&&(U.viewport=void 0),v.setupLightsView(U),Oe===!0&&ue.setGlobalState(O.clippingPlanes,U),va(o,w,U),i.updateMultisampleRenderTarget(b),i.updateRenderTargetMipmap(b),Ne.has("WEBGL_multisampled_render_to_texture")===!1){let we=!1;for(let Se=0,je=M.length;Se<je;Se++){const rt=M[Se],{object:et,geometry:Ke,material:at,group:_e}=rt;if(at.side===Ut&&et.layers.test(U.layers)){const vt=at.side;at.side=ht,at.needsUpdate=!0,ci(et,w,U,Ke,at,_e),at.side=vt,at.needsUpdate=!0,we=!0}}we===!0&&(i.updateMultisampleRenderTarget(b),i.updateRenderTargetMipmap(b))}O.setRenderTarget(ce,me,he),O.setClearColor(Ae,De),Pe!==void 0&&(U.viewport=Pe),O.toneMapping=xe}function va(o,M,w){const U=M.isScene===!0?M.overrideMaterial:null;for(let b=0,J=o.length;b<J;b++){const ce=o[b],{object:me,geometry:he,group:xe}=ce;let Pe=ce.material;Pe.allowOverride===!0&&U!==null&&(Pe=U),me.layers.test(w.layers)&&ci(me,M,w,he,Pe,xe)}}function ci(o,M,w,U,b,J){o.onBeforeRender(O,M,w,U,b,J),o.modelViewMatrix.multiplyMatrices(w.matrixWorldInverse,o.matrixWorld),o.normalMatrix.getNormalMatrix(o.modelViewMatrix),b.onBeforeRender(O,M,w,U,o,J),b.transparent===!0&&b.side===Ut&&b.forceSinglePass===!1?(b.side=ht,b.needsUpdate=!0,O.renderBufferDirect(w,M,U,b,o,J),b.side=Qt,b.needsUpdate=!0,O.renderBufferDirect(w,M,U,b,o,J),b.side=Ut):O.renderBufferDirect(w,M,U,b,o,J),o.onAfterRender(O,M,w,U,b,J)}function Ea(o,M,w){M.isScene!==!0&&(M=dt);const U=u.get(o),b=v.state.lights,J=v.state.shadowsArray,ce=b.state.version,me=re.getParameters(o,b.state,J,M,w,v.state.lightProbeGridArray),he=re.getProgramCacheKey(me);let xe=U.programs;U.environment=o.isMeshStandardMaterial||o.isMeshLambertMaterial||o.isMeshPhongMaterial?M.environment:null,U.fog=M.fog;const Pe=o.isMeshStandardMaterial||o.isMeshLambertMaterial&&!o.envMap||o.isMeshPhongMaterial&&!o.envMap;U.envMap=C.get(o.envMap||U.environment,Pe),U.envMapRotation=U.environment!==null&&o.envMap===null?M.environmentRotation:o.envMapRotation,xe===void 0&&(o.addEventListener("dispose",ut),xe=new Map,U.programs=xe);let we=xe.get(he);if(we!==void 0){if(U.currentProgram===we&&U.lightsStateVersion===ce)return ui(o,me),we}else me.uniforms=re.getUniforms(o),I!==null&&o.isNodeMaterial&&I.build(o,w,me),o.onBeforeCompile(me,O),we=re.acquireProgram(me,he),xe.set(he,we),U.uniforms=me.uniforms;const Se=U.uniforms;return(!o.isShaderMaterial&&!o.isRawShaderMaterial||o.clipping===!0)&&(Se.clippingPlanes=ue.uniform),ui(o,me),U.needsLights=po(o),U.lightsStateVersion=ce,U.needsLights&&(Se.ambientLightColor.value=b.state.ambient,Se.lightProbe.value=b.state.probe,Se.directionalLights.value=b.state.directional,Se.directionalLightShadows.value=b.state.directionalShadow,Se.spotLights.value=b.state.spot,Se.spotLightShadows.value=b.state.spotShadow,Se.rectAreaLights.value=b.state.rectArea,Se.ltc_1.value=b.state.rectAreaLTC1,Se.ltc_2.value=b.state.rectAreaLTC2,Se.pointLights.value=b.state.point,Se.pointLightShadows.value=b.state.pointShadow,Se.hemisphereLights.value=b.state.hemi,Se.directionalShadowMatrix.value=b.state.directionalShadowMatrix,Se.spotLightMatrix.value=b.state.spotLightMatrix,Se.spotLightMap.value=b.state.spotLightMap,Se.pointShadowMatrix.value=b.state.pointShadowMatrix),U.lightProbeGrid=v.state.lightProbeGridArray.length>0,U.currentProgram=we,U.uniformsList=null,we}function di(o){if(o.uniformsList===null){const M=o.currentProgram.getUniforms();o.uniformsList=Oa.seqWithValue(M.seq,o.uniforms)}return o.uniformsList}function ui(o,M){const w=u.get(o);w.outputColorSpace=M.outputColorSpace,w.batching=M.batching,w.batchingColor=M.batchingColor,w.instancing=M.instancing,w.instancingColor=M.instancingColor,w.instancingMorph=M.instancingMorph,w.skinning=M.skinning,w.morphTargets=M.morphTargets,w.morphNormals=M.morphNormals,w.morphColors=M.morphColors,w.morphTargetsCount=M.morphTargetsCount,w.numClippingPlanes=M.numClippingPlanes,w.numIntersection=M.numClipIntersection,w.vertexAlphas=M.vertexAlphas,w.vertexTangents=M.vertexTangents,w.toneMapping=M.toneMapping}function co(o,M){if(o.length===0)return null;if(o.length===1)return o[0].texture!==null?o[0]:null;R.setFromMatrixPosition(M.matrixWorld);for(let w=0,U=o.length;w<U;w++){const b=o[w];if(b.texture!==null&&b.boundingBox.containsPoint(R))return b}return null}function uo(o,M,w,U,b){M.isScene!==!0&&(M=dt),i.resetTextureUnits();const J=M.fog,ce=U.isMeshStandardMaterial||U.isMeshLambertMaterial||U.isMeshPhongMaterial?M.environment:null,me=y===null?O.outputColorSpace:y.isXRRenderTarget===!0?y.texture.colorSpace:Qe.workingColorSpace,he=U.isMeshStandardMaterial||U.isMeshLambertMaterial&&!U.envMap||U.isMeshPhongMaterial&&!U.envMap,xe=C.get(U.envMap||ce,he),Pe=U.vertexColors===!0&&!!w.attributes.color&&w.attributes.color.itemSize===4,we=!!w.attributes.tangent&&(!!U.normalMap||U.anisotropy>0),Se=!!w.morphAttributes.position,je=!!w.morphAttributes.normal,rt=!!w.morphAttributes.color;let et=Tt;U.toneMapped&&(y===null||y.isXRRenderTarget===!0)&&(et=O.toneMapping);const Ke=w.morphAttributes.position||w.morphAttributes.normal||w.morphAttributes.color,at=Ke!==void 0?Ke.length:0,_e=u.get(U),vt=v.state.lights;if(Oe===!0&&(Ge===!0||o!==B)){const We=o===B&&U.id===G;ue.setState(U,o,We)}let Vt=!1;U.version===_e.__version?(_e.needsLights&&_e.lightsStateVersion!==vt.state.version||_e.outputColorSpace!==me||b.isBatchedMesh&&_e.batching===!1||!b.isBatchedMesh&&_e.batching===!0||b.isBatchedMesh&&_e.batchingColor===!0&&b.colorTexture===null||b.isBatchedMesh&&_e.batchingColor===!1&&b.colorTexture!==null||b.isInstancedMesh&&_e.instancing===!1||!b.isInstancedMesh&&_e.instancing===!0||b.isSkinnedMesh&&_e.skinning===!1||!b.isSkinnedMesh&&_e.skinning===!0||b.isInstancedMesh&&_e.instancingColor===!0&&b.instanceColor===null||b.isInstancedMesh&&_e.instancingColor===!1&&b.instanceColor!==null||b.isInstancedMesh&&_e.instancingMorph===!0&&b.morphTexture===null||b.isInstancedMesh&&_e.instancingMorph===!1&&b.morphTexture!==null||_e.envMap!==xe||U.fog===!0&&_e.fog!==J||_e.numClippingPlanes!==void 0&&(_e.numClippingPlanes!==ue.numPlanes||_e.numIntersection!==ue.numIntersection)||_e.vertexAlphas!==Pe||_e.vertexTangents!==we||_e.morphTargets!==Se||_e.morphNormals!==je||_e.morphColors!==rt||_e.toneMapping!==et||_e.morphTargetsCount!==at||!!_e.lightProbeGrid!=v.state.lightProbeGridArray.length>0)&&(Vt=!0):(Vt=!0,_e.__version=U.version);let Et=_e.currentProgram;Vt===!0&&(Et=Ea(U,M,b),I&&U.isNodeMaterial&&I.onUpdateProgram(U,Et,_e));let Rt=!1,yt=!1,Zt=!1;const ze=Et.getUniforms(),it=_e.uniforms;if(oe.useProgram(Et.program)&&(Rt=!0,yt=!0,Zt=!0),U.id!==G&&(G=U.id,yt=!0),_e.needsLights){const We=co(v.state.lightProbeGridArray,b);_e.lightProbeGrid!==We&&(_e.lightProbeGrid=We,yt=!0)}if(Rt||B!==o){oe.buffers.depth.getReversed()&&o.reversedDepth!==!0&&(o._reversedDepth=!0,o.updateProjectionMatrix()),ze.setValue(E,"projectionMatrix",o.projectionMatrix),ze.setValue(E,"viewMatrix",o.matrixWorldInverse);const We=ze.map.cameraPosition;We!==void 0&&We.setValue(E,ct.setFromMatrixPosition(o.matrixWorld)),qe.logarithmicDepthBuffer&&ze.setValue(E,"logDepthBufFC",2/(Math.log(o.far+1)/Math.LN2)),(U.isMeshPhongMaterial||U.isMeshToonMaterial||U.isMeshLambertMaterial||U.isMeshBasicMaterial||U.isMeshStandardMaterial||U.isShaderMaterial)&&ze.setValue(E,"isOrthographic",o.isOrthographicCamera===!0),B!==o&&(B=o,yt=!0,Zt=!0)}if(_e.needsLights&&(vt.state.directionalShadowMap.length>0&&ze.setValue(E,"directionalShadowMap",vt.state.directionalShadowMap,i),vt.state.spotShadowMap.length>0&&ze.setValue(E,"spotShadowMap",vt.state.spotShadowMap,i),vt.state.pointShadowMap.length>0&&ze.setValue(E,"pointShadowMap",vt.state.pointShadowMap,i)),b.isSkinnedMesh){ze.setOptional(E,b,"bindMatrix"),ze.setOptional(E,b,"bindMatrixInverse");const We=b.skeleton;We&&(We.boneTexture===null&&We.computeBoneTexture(),ze.setValue(E,"boneTexture",We.boneTexture,i))}b.isBatchedMesh&&(ze.setOptional(E,b,"batchingTexture"),ze.setValue(E,"batchingTexture",b._matricesTexture,i),ze.setOptional(E,b,"batchingIdTexture"),ze.setValue(E,"batchingIdTexture",b._indirectTexture,i),ze.setOptional(E,b,"batchingColorTexture"),b._colorsTexture!==null&&ze.setValue(E,"batchingColorTexture",b._colorsTexture,i));const Ft=w.morphAttributes;if((Ft.position!==void 0||Ft.normal!==void 0||Ft.color!==void 0)&&Re.update(b,w,Et),(yt||_e.receiveShadow!==b.receiveShadow)&&(_e.receiveShadow=b.receiveShadow,ze.setValue(E,"receiveShadow",b.receiveShadow)),(U.isMeshStandardMaterial||U.isMeshLambertMaterial||U.isMeshPhongMaterial)&&U.envMap===null&&M.environment!==null&&(it.envMapIntensity.value=M.environmentIntensity),it.dfgLUT!==void 0&&(it.dfgLUT.value=pu()),yt){if(ze.setValue(E,"toneMappingExposure",O.toneMappingExposure),_e.needsLights&&fo(it,Zt),J&&U.fog===!0&&S.refreshFogUniforms(it,J),S.refreshMaterialUniforms(it,U,Ue,Ye,v.state.transmissionRenderTarget[o.id]),_e.needsLights&&_e.lightProbeGrid){const We=_e.lightProbeGrid;it.probesSH.value=We.texture,it.probesMin.value.copy(We.boundingBox.min),it.probesMax.value.copy(We.boundingBox.max),it.probesResolution.value.copy(We.resolution)}Oa.upload(E,di(_e),it,i)}if(U.isShaderMaterial&&U.uniformsNeedUpdate===!0&&(Oa.upload(E,di(_e),it,i),U.uniformsNeedUpdate=!1),U.isSpriteMaterial&&ze.setValue(E,"center",b.center),ze.setValue(E,"modelViewMatrix",b.modelViewMatrix),ze.setValue(E,"normalMatrix",b.normalMatrix),ze.setValue(E,"modelMatrix",b.matrixWorld),U.uniformsGroups!==void 0){const We=U.uniformsGroups;for(let oa=0,$t=We.length;oa<$t;oa++){const fi=We[oa];$.update(fi,Et),$.bind(fi,Et)}}return Et}function fo(o,M){o.ambientLightColor.needsUpdate=M,o.lightProbe.needsUpdate=M,o.directionalLights.needsUpdate=M,o.directionalLightShadows.needsUpdate=M,o.pointLights.needsUpdate=M,o.pointLightShadows.needsUpdate=M,o.spotLights.needsUpdate=M,o.spotLightShadows.needsUpdate=M,o.rectAreaLights.needsUpdate=M,o.hemisphereLights.needsUpdate=M}function po(o){return o.isMeshLambertMaterial||o.isMeshToonMaterial||o.isMeshPhongMaterial||o.isMeshStandardMaterial||o.isShadowMaterial||o.isShaderMaterial&&o.lights===!0}this.getActiveCubeFace=function(){return Z},this.getActiveMipmapLevel=function(){return q},this.getRenderTarget=function(){return y},this.setRenderTargetTextures=function(o,M,w){const U=u.get(o);U.__autoAllocateDepthBuffer=o.resolveDepthBuffer===!1,U.__autoAllocateDepthBuffer===!1&&(U.__useRenderToTexture=!1),u.get(o.texture).__webglTexture=M,u.get(o.depthTexture).__webglTexture=U.__autoAllocateDepthBuffer?void 0:w,U.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(o,M){const w=u.get(o);w.__webglFramebuffer=M,w.__useDefaultFramebuffer=M===void 0};const mo=E.createFramebuffer();this.setRenderTarget=function(o,M=0,w=0){y=o,Z=M,q=w;let U=null,b=!1,J=!1;if(o){const ce=u.get(o);if(ce.__useDefaultFramebuffer!==void 0){oe.bindFramebuffer(E.FRAMEBUFFER,ce.__webglFramebuffer),Q.copy(o.viewport),de.copy(o.scissor),fe=o.scissorTest,oe.viewport(Q),oe.scissor(de),oe.setScissorTest(fe),G=-1;return}else if(ce.__webglFramebuffer===void 0)i.setupRenderTarget(o);else if(ce.__hasExternalTextures)i.rebindTextures(o,u.get(o.texture).__webglTexture,u.get(o.depthTexture).__webglTexture);else if(o.depthBuffer){const xe=o.depthTexture;if(ce.__boundDepthTexture!==xe){if(xe!==null&&u.has(xe)&&(o.width!==xe.image.width||o.height!==xe.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");i.setupDepthRenderbuffer(o)}}const me=o.texture;(me.isData3DTexture||me.isDataArrayTexture||me.isCompressedArrayTexture)&&(J=!0);const he=u.get(o).__webglFramebuffer;o.isWebGLCubeRenderTarget?(Array.isArray(he[M])?U=he[M][w]:U=he[M],b=!0):o.samples>0&&i.useMultisampledRTT(o)===!1?U=u.get(o).__webglMultisampledFramebuffer:Array.isArray(he)?U=he[w]:U=he,Q.copy(o.viewport),de.copy(o.scissor),fe=o.scissorTest}else Q.copy(te).multiplyScalar(Ue).floor(),de.copy(Te).multiplyScalar(Ue).floor(),fe=Ce;if(w!==0&&(U=mo),oe.bindFramebuffer(E.FRAMEBUFFER,U)&&oe.drawBuffers(o,U),oe.viewport(Q),oe.scissor(de),oe.setScissorTest(fe),b){const ce=u.get(o.texture);E.framebufferTexture2D(E.FRAMEBUFFER,E.COLOR_ATTACHMENT0,E.TEXTURE_CUBE_MAP_POSITIVE_X+M,ce.__webglTexture,w)}else if(J){const ce=M;for(let me=0;me<o.textures.length;me++){const he=u.get(o.textures[me]);E.framebufferTextureLayer(E.FRAMEBUFFER,E.COLOR_ATTACHMENT0+me,he.__webglTexture,w,ce)}}else if(o!==null&&w!==0){const ce=u.get(o.texture);E.framebufferTexture2D(E.FRAMEBUFFER,E.COLOR_ATTACHMENT0,E.TEXTURE_2D,ce.__webglTexture,w)}G=-1},this.readRenderTargetPixels=function(o,M,w,U,b,J,ce,me=0){if(!(o&&o.isWebGLRenderTarget)){Xe("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let he=u.get(o).__webglFramebuffer;if(o.isWebGLCubeRenderTarget&&ce!==void 0&&(he=he[ce]),he){oe.bindFramebuffer(E.FRAMEBUFFER,he);try{const xe=o.textures[me],Pe=xe.format,we=xe.type;if(o.textures.length>1&&E.readBuffer(E.COLOR_ATTACHMENT0+me),!qe.textureFormatReadable(Pe)){Xe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!qe.textureTypeReadable(we)){Xe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}M>=0&&M<=o.width-U&&w>=0&&w<=o.height-b&&E.readPixels(M,w,U,b,_.convert(Pe),_.convert(we),J)}finally{const xe=y!==null?u.get(y).__webglFramebuffer:null;oe.bindFramebuffer(E.FRAMEBUFFER,xe)}}},this.readRenderTargetPixelsAsync=async function(o,M,w,U,b,J,ce,me=0){if(!(o&&o.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let he=u.get(o).__webglFramebuffer;if(o.isWebGLCubeRenderTarget&&ce!==void 0&&(he=he[ce]),he)if(M>=0&&M<=o.width-U&&w>=0&&w<=o.height-b){oe.bindFramebuffer(E.FRAMEBUFFER,he);const xe=o.textures[me],Pe=xe.format,we=xe.type;if(o.textures.length>1&&E.readBuffer(E.COLOR_ATTACHMENT0+me),!qe.textureFormatReadable(Pe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!qe.textureTypeReadable(we))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Se=E.createBuffer();E.bindBuffer(E.PIXEL_PACK_BUFFER,Se),E.bufferData(E.PIXEL_PACK_BUFFER,J.byteLength,E.STREAM_READ),E.readPixels(M,w,U,b,_.convert(Pe),_.convert(we),0);const je=y!==null?u.get(y).__webglFramebuffer:null;oe.bindFramebuffer(E.FRAMEBUFFER,je);const rt=E.fenceSync(E.SYNC_GPU_COMMANDS_COMPLETE,0);return E.flush(),await So(E,rt,4),E.bindBuffer(E.PIXEL_PACK_BUFFER,Se),E.getBufferSubData(E.PIXEL_PACK_BUFFER,0,J),E.deleteBuffer(Se),E.deleteSync(rt),J}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(o,M=null,w=0){const U=Math.pow(2,-w),b=Math.floor(o.image.width*U),J=Math.floor(o.image.height*U),ce=M!==null?M.x:0,me=M!==null?M.y:0;i.setTexture2D(o,0),E.copyTexSubImage2D(E.TEXTURE_2D,w,0,0,ce,me,b,J),oe.unbindTexture()};const ho=E.createFramebuffer(),_o=E.createFramebuffer();this.copyTextureToTexture=function(o,M,w=null,U=null,b=0,J=0){let ce,me,he,xe,Pe,we,Se,je,rt;const et=o.isCompressedTexture?o.mipmaps[J]:o.image;if(w!==null)ce=w.max.x-w.min.x,me=w.max.y-w.min.y,he=w.isBox3?w.max.z-w.min.z:1,xe=w.min.x,Pe=w.min.y,we=w.isBox3?w.min.z:0;else{const it=Math.pow(2,-b);ce=Math.floor(et.width*it),me=Math.floor(et.height*it),o.isDataArrayTexture?he=et.depth:o.isData3DTexture?he=Math.floor(et.depth*it):he=1,xe=0,Pe=0,we=0}U!==null?(Se=U.x,je=U.y,rt=U.z):(Se=0,je=0,rt=0);const Ke=_.convert(M.format),at=_.convert(M.type);let _e;M.isData3DTexture?(i.setTexture3D(M,0),_e=E.TEXTURE_3D):M.isDataArrayTexture||M.isCompressedArrayTexture?(i.setTexture2DArray(M,0),_e=E.TEXTURE_2D_ARRAY):(i.setTexture2D(M,0),_e=E.TEXTURE_2D),oe.activeTexture(E.TEXTURE0),oe.pixelStorei(E.UNPACK_FLIP_Y_WEBGL,M.flipY),oe.pixelStorei(E.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),oe.pixelStorei(E.UNPACK_ALIGNMENT,M.unpackAlignment);const vt=oe.getParameter(E.UNPACK_ROW_LENGTH),Vt=oe.getParameter(E.UNPACK_IMAGE_HEIGHT),Et=oe.getParameter(E.UNPACK_SKIP_PIXELS),Rt=oe.getParameter(E.UNPACK_SKIP_ROWS),yt=oe.getParameter(E.UNPACK_SKIP_IMAGES);oe.pixelStorei(E.UNPACK_ROW_LENGTH,et.width),oe.pixelStorei(E.UNPACK_IMAGE_HEIGHT,et.height),oe.pixelStorei(E.UNPACK_SKIP_PIXELS,xe),oe.pixelStorei(E.UNPACK_SKIP_ROWS,Pe),oe.pixelStorei(E.UNPACK_SKIP_IMAGES,we);const Zt=o.isDataArrayTexture||o.isData3DTexture,ze=M.isDataArrayTexture||M.isData3DTexture;if(o.isDepthTexture){const it=u.get(o),Ft=u.get(M),We=u.get(it.__renderTarget),oa=u.get(Ft.__renderTarget);oe.bindFramebuffer(E.READ_FRAMEBUFFER,We.__webglFramebuffer),oe.bindFramebuffer(E.DRAW_FRAMEBUFFER,oa.__webglFramebuffer);for(let $t=0;$t<he;$t++)Zt&&(E.framebufferTextureLayer(E.READ_FRAMEBUFFER,E.COLOR_ATTACHMENT0,u.get(o).__webglTexture,b,we+$t),E.framebufferTextureLayer(E.DRAW_FRAMEBUFFER,E.COLOR_ATTACHMENT0,u.get(M).__webglTexture,J,rt+$t)),E.blitFramebuffer(xe,Pe,ce,me,Se,je,ce,me,E.DEPTH_BUFFER_BIT,E.NEAREST);oe.bindFramebuffer(E.READ_FRAMEBUFFER,null),oe.bindFramebuffer(E.DRAW_FRAMEBUFFER,null)}else if(b!==0||o.isRenderTargetTexture||u.has(o)){const it=u.get(o),Ft=u.get(M);oe.bindFramebuffer(E.READ_FRAMEBUFFER,ho),oe.bindFramebuffer(E.DRAW_FRAMEBUFFER,_o);for(let We=0;We<he;We++)Zt?E.framebufferTextureLayer(E.READ_FRAMEBUFFER,E.COLOR_ATTACHMENT0,it.__webglTexture,b,we+We):E.framebufferTexture2D(E.READ_FRAMEBUFFER,E.COLOR_ATTACHMENT0,E.TEXTURE_2D,it.__webglTexture,b),ze?E.framebufferTextureLayer(E.DRAW_FRAMEBUFFER,E.COLOR_ATTACHMENT0,Ft.__webglTexture,J,rt+We):E.framebufferTexture2D(E.DRAW_FRAMEBUFFER,E.COLOR_ATTACHMENT0,E.TEXTURE_2D,Ft.__webglTexture,J),b!==0?E.blitFramebuffer(xe,Pe,ce,me,Se,je,ce,me,E.COLOR_BUFFER_BIT,E.NEAREST):ze?E.copyTexSubImage3D(_e,J,Se,je,rt+We,xe,Pe,ce,me):E.copyTexSubImage2D(_e,J,Se,je,xe,Pe,ce,me);oe.bindFramebuffer(E.READ_FRAMEBUFFER,null),oe.bindFramebuffer(E.DRAW_FRAMEBUFFER,null)}else ze?o.isDataTexture||o.isData3DTexture?E.texSubImage3D(_e,J,Se,je,rt,ce,me,he,Ke,at,et.data):M.isCompressedArrayTexture?E.compressedTexSubImage3D(_e,J,Se,je,rt,ce,me,he,Ke,et.data):E.texSubImage3D(_e,J,Se,je,rt,ce,me,he,Ke,at,et):o.isDataTexture?E.texSubImage2D(E.TEXTURE_2D,J,Se,je,ce,me,Ke,at,et.data):o.isCompressedTexture?E.compressedTexSubImage2D(E.TEXTURE_2D,J,Se,je,et.width,et.height,Ke,et.data):E.texSubImage2D(E.TEXTURE_2D,J,Se,je,ce,me,Ke,at,et);oe.pixelStorei(E.UNPACK_ROW_LENGTH,vt),oe.pixelStorei(E.UNPACK_IMAGE_HEIGHT,Vt),oe.pixelStorei(E.UNPACK_SKIP_PIXELS,Et),oe.pixelStorei(E.UNPACK_SKIP_ROWS,Rt),oe.pixelStorei(E.UNPACK_SKIP_IMAGES,yt),J===0&&M.generateMipmaps&&E.generateMipmap(_e),oe.unbindTexture()},this.initRenderTarget=function(o){u.get(o).__webglFramebuffer===void 0&&i.setupRenderTarget(o)},this.initTexture=function(o){o.isCubeTexture?i.setTextureCube(o,0):o.isData3DTexture?i.setTexture3D(o,0):o.isDataArrayTexture||o.isCompressedArrayTexture?i.setTexture2DArray(o,0):i.setTexture2D(o,0),oe.unbindTexture()},this.resetState=function(){Z=0,q=0,y=null,oe.reset(),W.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return jr}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(a){this._outputColorSpace=a;const t=this.getContext();t.drawingBufferColorSpace=Qe._getDrawingBufferColorSpace(a),t.unpackColorSpace=Qe._getUnpackColorSpace()}}export{Qa as ACESFilmicToneMapping,aa as AddEquation,xi as AddOperation,dr as AdditiveBlending,$a as AgXToneMapping,xn as AlphaFormat,_n as AlwaysCompare,tn as AlwaysDepth,bn as ArrayCamera,ht as BackSide,Sa as BoxGeometry,da as BufferAttribute,la as BufferGeometry,Tn as ByteType,Ja as CineonToneMapping,ba as ClampToEdgeWrapping,$e as Color,Qe as ColorManagement,Fi as ConstantAlphaFactor,Bi as ConstantColorFactor,_i as CubeCamera,Ni as CubeDepthTexture,Jt as CubeReflectionMapping,zt as CubeRefractionMapping,Ya as CubeTexture,sa as CubeUVReflectionMapping,sr as CullFaceBack,nn as CullFaceFront,rn as CullFaceNone,on as CustomBlending,Ka as CustomToneMapping,Ti as Data3DTexture,qa as DataArrayTexture,Pn as DataTexture,Yt as DepthFormat,jt as DepthStencilFormat,ea as DepthTexture,Ut as DoubleSide,zi as DstAlphaFactor,ki as DstColorFactor,mn as EqualCompare,Ji as EqualDepth,Ta as EquirectangularReflectionMapping,Ma as EquirectangularRefractionMapping,Cn as EventDispatcher,Yr as ExternalTexture,ja as Float32BufferAttribute,It as FloatType,Qt as FrontSide,nr as Frustum,ar as GLSL3,pn as GreaterCompare,$i as GreaterDepth,xa as GreaterEqualCompare,Qi as GreaterEqualDepth,wt as HalfFloatType,za as IntType,Pi as Layers,hn as LessCompare,en as LessDepth,Aa as LessEqualCompare,or as LessEqualDepth,_t as LinearFilter,kt as LinearMipmapLinearFilter,Pa as LinearMipmapNearestFilter,Xa as LinearSRGBColorSpace,tr as LinearToneMapping,rr as LinearTransfer,Fe as Matrix3,Wt as Matrix4,ln as MaxEquation,Ct as Mesh,hi as MeshBasicMaterial,Di as MeshDepthMaterial,Ui as MeshDistanceMaterial,sn as MinEquation,cn as MirroredRepeatWrapping,Ai as MixOperation,lr as MultiplyBlending,Ri as MultiplyOperation,Ot as NearestFilter,pa as NearestMipmapLinearFilter,un as NearestMipmapNearestFilter,Za as NeutralToneMapping,gn as NeverCompare,an as NeverDepth,Dt as NoBlending,qt as NoColorSpace,Tt as NoToneMapping,fa as NormalBlending,fn as NotEqualCompare,Zi as NotEqualDepth,bi as ObjectSpaceNormalMap,ji as OneFactor,yi as OneMinusConstantAlphaFactor,Oi as OneMinusConstantColorFactor,Gi as OneMinusDstAlphaFactor,Hi as OneMinusDstColorFactor,Vi as OneMinusSrcAlphaFactor,Wi as OneMinusSrcColorFactor,ka as OrthographicCamera,ua as PCFShadowMap,Li as PCFSoftShadowMap,Jr as PMREMGenerator,ca as PerspectiveCamera,mi as Plane,Wa as PlaneGeometry,xr as R11_EAC_Format,Ca as RED_GREEN_RGTC2_Format,zr as RED_RGTC1_Format,Ln as REVISION,Ra as RG11_EAC_Format,Pt as RGBAFormat,hr as RGBAIntegerFormat,Or as RGBA_ASTC_10x10_Format,Ir as RGBA_ASTC_10x5_Format,yr as RGBA_ASTC_10x6_Format,Fr as RGBA_ASTC_10x8_Format,Br as RGBA_ASTC_12x10_Format,Gr as RGBA_ASTC_12x12_Format,Cr as RGBA_ASTC_4x4_Format,br as RGBA_ASTC_5x4_Format,Pr as RGBA_ASTC_5x5_Format,Dr as RGBA_ASTC_6x5_Format,Ur as RGBA_ASTC_6x6_Format,Lr as RGBA_ASTC_8x5_Format,Nr as RGBA_ASTC_8x6_Format,wr as RGBA_ASTC_8x8_Format,Hr as RGBA_BPTC_Format,Mr as RGBA_ETC2_EAC_Format,Er as RGBA_PVRTC_2BPPV1_Format,vr as RGBA_PVRTC_4BPPV1_Format,Ua as RGBA_S3TC_DXT1_Format,La as RGBA_S3TC_DXT3_Format,Na as RGBA_S3TC_DXT5_Format,An as RGBFormat,Vr as RGB_BPTC_SIGNED_Format,Wr as RGB_BPTC_UNSIGNED_Format,Sr as RGB_ETC1_Format,Tr as RGB_ETC2_Format,gr as RGB_PVRTC_2BPPV1_Format,_r as RGB_PVRTC_4BPPV1_Format,Da as RGB_S3TC_DXT1_Format,Xt as RGFormat,mr as RGIntegerFormat,Si as RawShaderMaterial,Rn as RedFormat,pr as RedIntegerFormat,er as ReinhardToneMapping,dn as RepeatWrapping,wi as ReverseSubtractEquation,Ar as SIGNED_R11_EAC_Format,Xr as SIGNED_RED_GREEN_RGTC2_Format,kr as SIGNED_RED_RGTC1_Format,Rr as SIGNED_RG11_EAC_Format,Un as SRGBColorSpace,ke as SRGBTransfer,be as ShaderChunk,xt as ShaderLib,bt as ShaderMaterial,Mn as ShortType,Yi as SrcAlphaFactor,Xi as SrcAlphaSaturateFactor,qi as SrcColorFactor,Ii as SubtractEquation,cr as SubtractiveBlending,ir as TangentSpaceNormalMap,Mi as Texture,Ei as Uint16BufferAttribute,vi as Uint32BufferAttribute,ne as UniformsLib,Ci as UniformsUtils,St as UnsignedByteType,Sn as UnsignedInt101111Type,ra as UnsignedInt248Type,En as UnsignedInt5999Type,Bt as UnsignedIntType,ur as UnsignedShort4444Type,fr as UnsignedShort5551Type,ma as UnsignedShortType,ta as VSMShadowMap,ft as Vector2,Ie as Vector3,pt as Vector4,jr as WebGLCoordinateSystem,ei as WebGLCubeRenderTarget,Mt as WebGLRenderTarget,mu as WebGLRenderer,oo as WebGLUtils,wa as WebXRController,Ki as ZeroFactor,Dn as createCanvasElement,Xe as error,qr as log,Be as warn,gi as warnOnce};
