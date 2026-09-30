import {getBodies,basis,sub} from './solar-system.js';
import {eventVisuals,WHITE_DWARF_SHELL_AXES} from './solar-effects.js';
import {visualProfile,NATURAL_COLOR_GLSL,RECOMBINATION_COLOR_GLSL} from './visual-science.js';

const CURRENT_APPEARANCES={io:15,europa:16,ganymede:17,titan:18,callisto:10,ceres:10,pluto:19};
export const renderAppearance=body=>body.eraAppearance??CURRENT_APPEARANCES[body.id]??body.appearance??body.index??10;

// Local visualization maps; attribution and processing: assets/textures/CREDITS.md.
const textureImages=['planet-atlas.jpg','stars_milky_way.jpg'].map(name=>{
  if(typeof Image==='undefined')return null;
  const image=new Image();image.decoding='async';image.src=new URL(`../assets/textures/${name}`,import.meta.url).href;return image;
});
export const rendererReady=Promise.all(textureImages.map(image=>!image?Promise.resolve():image.decode().catch(()=>{
  if(image.complete&&image.naturalWidth)return;
  throw new Error('惑星の画像を読み込めませんでした。ページを再読み込みしてください。');
})));
rendererReady.catch(()=>{});
const vertex=`attribute vec2 aPosition;varying vec2 uv;void main(){uv=aPosition;gl_Position=vec4(aPosition,0.,1.);}`;
function fragmentSource(maxBodies){return `precision highp float;
varying vec2 uv;
uniform vec2 uResolution;
uniform vec3 uRight,uUp,uForward,uCamera;
uniform vec4 uBodies[${maxBodies}],uMaterial[${maxBodies}];
uniform vec4 uSun,uSaturn,uComet,uEarth;
uniform vec3 uShellAxes;
uniform float uSaturnTilt,uCometActivity,uEra,uLoaded,uEventProgress,uClock,uImpact,uDebris;
uniform float uNatural,uIllustratedSky,uSkySeed;
uniform sampler2D uAtlas,uSky;
const float PI=3.14159265359;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float terrain(vec3 p){return noise(p)*.57+noise(p*2.07)*.28+noise(p*4.13)*.15;}
vec2 sphereUV(vec3 n){return vec2(fract(.5+atan(n.z,n.x)/(2.*PI)),clamp(.5-asin(clamp(n.y,-1.,1.))/PI,.001,.999));}
vec3 map(float tile,vec3 n){vec2 st=sphereUV(n);st=clamp(st,vec2(.0015,.003),vec2(.9985,.997));return texture2D(uAtlas,(vec2(mod(tile,4.),floor(tile/4.))+st)/4.).rgb;}
vec3 localNormal(vec3 n,vec4 material){
 float t=material.z,c=cos(t),s=sin(t);n=vec3(c*n.x-s*n.y,s*n.x+c*n.y,n.z);
 c=cos(material.y);s=sin(material.y);return vec3(c*n.x-s*n.z,n.y,s*n.x+c*n.z);
}
vec3 worldNormal(vec3 n,vec4 material){
 float c=cos(material.y),s=sin(material.y);n=vec3(c*n.x+s*n.z,n.y,-s*n.x+c*n.z);
 c=cos(material.z);s=sin(material.z);return vec3(c*n.x+s*n.y,-s*n.x+c*n.y,n.z);
}
vec3 rock(vec3 n,float icy){
 float f=terrain(n*7.),grain=noise(n*220.);vec3 col=mix(vec3(.13,.115,.10),vec3(.55,.51,.43),f);
 vec3 cell=floor(n*27.),p=fract(n*27.)-.5;float pit=exp(-dot(p,p)*28.)*step(.52,hash(cell));
 col*=.85+grain*.24-pit*.42;vec3 frost=mix(vec3(.31,.32,.34),vec3(.87,.88,.81),f);
 return mix(col,frost*(.87+grain*.16-pit*.29),icy);
}
// Ancient/future planets use rotationally continuous procedural maps. They
// show different materials and cooling, not present-day photographed features.
vec3 youngRock(vec3 n,float mars){
 float crust=terrain(n*10.),grain=noise(n*170.);
 vec3 cell=floor(n*18.),patch=fract(n*18.)-.5;float pit=exp(-dot(patch,patch)*30.)*step(.64,hash(cell));
 vec3 dark=mix(vec3(.15,.13,.115),vec3(.33,.27,.21),crust);
 if(mars>.5)dark=mix(vec3(.105,.115,.11),vec3(.28,.24,.195),crust);
 float fissure=(1.-smoothstep(.015,.055,abs(noise(n*31.)-.5)))*smoothstep(.63,.79,terrain(n*6.));
 return mix(dark*(.83+grain*.3-pit*.28),vec3(.70,.17,.025),fissure*mix(.75,.34,mars));
}
vec3 evolvingGas(vec3 n,float kind,float future){
 float warp=terrain(n*9.+vec3(kind*3.))-.5;
 float bands=.5+.5*sin(n.y*(kind<1.5?39.:19.)+warp*5.);
 float wisps=terrain(n*25.+vec3(kind,0.,4.));
 vec3 low=vec3(.38,.22,.13),high=vec3(.83,.66,.41);
 if(kind>.5){low=vec3(.46,.33,.21);high=vec3(.91,.76,.52);}
 if(kind>1.5){low=vec3(.26,.39,.39);high=vec3(.64,.72,.65);}
 if(kind>2.5){low=vec3(.18,.27,.40);high=vec3(.49,.61,.68);}
 // Older atmospheres are a different illustrative palette, not a measured
 // chemical prediction. Keep all giant planets gaseous in every epoch.
 low=mix(low,low*.55+vec3(.09,.115,.14),future);
 high=mix(high,high*.61+vec3(.13,.16,.19),future);
 return mix(low,high,clamp(.20+bands*.52+wisps*.27,0.,1.));
}
${NATURAL_COLOR_GLSL}
vec3 surface(float id,vec3 n){
 if(id>19.5){
   if(id<20.5)return youngRock(n,0.);
   if(id<21.5){float steam=terrain(n*8.);return mix(vec3(.42,.24,.14),vec3(.83,.66,.45),.36+steam*.57);}
   if(id<22.5)return youngRock(n,1.);
   if(id<26.5)return evolvingGas(n,id-23.,0.);
   if(id<27.5)return mix(rock(n,1.),rock(n,0.),.44);
   if(id<29.5)return rock(n,0.);
   if(id<30.5)return mix(rock(n,0.),vec3(.40,.25,.16),terrain(n*13.)*.28);
   if(id<34.5)return evolvingGas(n,id-31.,1.);
   return mix(rock(n,0.),vec3(.32,.29,.25),.25);
 }
 if(id<9.5){vec3 col=map(id,n);if(uLoaded<.5)col=mix(vec3(.25,.28,.31),vec3(.74,.58,.39),terrain(n*12.));if(uNatural>.5&&uEra<.5)col=naturalSurface(id,col);return col;}
 if(id<11.5)return rock(n,step(10.5,id));
 if(id<12.5){float f=terrain(n*8.),cracks=abs(noise(n*35.)-.5);vec3 magma=mix(vec3(.8,.025,.003),vec3(1.,.55,.04),f);return mix(vec3(.025,.019,.016),magma,min(1.,smoothstep(.39,.68,f)+.3*(1.-smoothstep(.025,.05,cracks))));}
 if(id<13.5)return mix(vec3(.91,.16,.025),vec3(1.,.53,.12),terrain(n*22.));
 if(id<14.5)return mix(vec3(.62,.79,1.),vec3(.99,1.,1.),.55+.4*terrain(n*12.));
 if(id<15.5){float sulfur=terrain(n*14.),vents=smoothstep(.69,.74,noise(n*63.));return mix(mix(vec3(.52,.34,.08),vec3(.93,.79,.29),sulfur),vec3(.07,.05,.025),vents);}
 if(id<16.5){float a=abs(noise(n*18.)-.5),b=abs(noise(n*39.+4.)-.5);float lines=(1.-smoothstep(.018,.045,a))*.7+(1.-smoothstep(.009,.018,b))*.25;return mix(vec3(.86,.85,.73),vec3(.36,.20,.10),lines);}
 if(id<17.5)return mix(rock(n,1.),rock(n,0.)*.8,smoothstep(.42,.66,terrain(n*4.)));
 if(id<18.5)return mix(vec3(.53,.30,.10),vec3(.89,.65,.29),.6+.2*terrain(n*8.));
 return mix(vec3(.30,.24,.20),vec3(.83,.74,.62),smoothstep(.36,.69,terrain(n*5.)));
}
// Direction-space fields have no longitude seam or polar image join. The
// compact star kernel is zero on every cell boundary, including at a pole.
float imaginedStars(vec3 ray,float scale,float seed,float cutoff){
 vec3 p=ray*scale+vec3(seed*7.13,seed*3.71,seed*11.53);
 vec3 cell=floor(p),local=fract(p)-.5;
 float kernel=max(0.,1.-4.*dot(local,local));
 return step(cutoff,hash(cell+seed))*pow(kernel,12.);
}
vec3 historicalSky(vec3 ray){
 // Seeds distinguish illustrative epochs; they do not predict the numbers,
 // positions, ages, or future survival of individual stars.
 float a=uSkySeed*.131,c=cos(a),s=sin(a);
 vec3 n=vec3(c*ray.x-s*ray.z,ray.y,s*ray.x+c*ray.z);
 n=normalize(vec3(n.x,.87*n.y-.493*n.z,.493*n.y+.87*n.z));
 float lane=exp(-n.y*n.y*95.);
 float broad=exp(-n.y*n.y*12.);
 float cloud=terrain(n*8.+vec3(uSkySeed));
 float dust=smoothstep(.39,.69,terrain(n*19.+vec3(uSkySeed,2.,4.)));
 float haze=2.*(broad*(.012+.018*cloud)+lane*(.015+.027*cloud)*(1.-dust*.78));
 vec3 color=vec3(.0018,.003,.006)+vec3(.53,.59,.69)*haze;
 // A modest exposure/point-size lift keeps stars legible on classroom screens.
 // sqrt widens the compact kernel without changing its zero-valued boundaries.
 float cool=sqrt(imaginedStars(n,390.,uSkySeed,.9975));
 float warm=sqrt(imaginedStars(n,220.,uSkySeed+19.,.997));
 float faint=sqrt(imaginedStars(n,620.,uSkySeed+43.,mix(.9986,.9965,broad)));
 color+=vec3(.66,.79,1.)*cool*1.05+vec3(1.,.82,.62)*warm*1.15+vec3(.72,.76,.82)*faint*.50;
 return color;
}
vec3 sky(vec3 ray){
 // This early epoch predates stars, planets and the Milky Way.
 if(uEra>0.5&&uEra<1.5){
   // The observer is inside a changing, approximately homogeneous universe.
   // There is deliberately no central explosion, edge, Milky Way or star field.
   float grain=terrain(ray*(4.+uEventProgress*13.)+vec3(uEventProgress*2.));
   vec3 hot=mix(vec3(1.,.94,.71),vec3(1.,.40,.09),smoothstep(0.,.72,uEventProgress));
   float clear=smoothstep(.76,1.,uEventProgress);
   if(uNatural>.5){
     vec3 warm=${RECOMBINATION_COLOR_GLSL};
     return mix(hot*.52,warm*.33,clear)*(1.+grain*.018);
   }
   return mix(hot*(.89+grain*.06),vec3(.12,.031,.010)*(1.+grain*.035),clear);
 }
 if(uIllustratedSky>.5)return historicalSky(ray);
 vec3 direction=normalize(vec3(ray.x*.91+ray.y*.41,-ray.x*.41+ray.y*.91,ray.z));
 vec3 starMap=texture2D(uSky,sphereUV(direction)).rgb;
 // Exposure lift keeps faint Milky Way dust lanes legible on classroom screens.
 vec3 color=pow(starMap,vec3(.68))*.85+vec3(.0018,.003,.006);
 vec3 cell=floor(ray*650.);vec3 local=fract(ray*650.)-.5;
 float sparkle=step(.99935,hash(cell))*exp(-dot(local,local)*40.);
 color+=sparkle*mix(vec3(.63,.78,1.),vec3(1.,.74,.43),hash(cell+7.));
 // Diffuse remote galaxies are scenery, with illustrative positions and brightness.
 vec3 gal=normalize(vec3(-.41,.47,-.78)),right=normalize(cross(gal,vec3(0.,1.,0.))),up=cross(right,gal);
 vec2 g=vec2(dot(ray,right)*2.5,dot(ray,up)*7.);float disk=exp(-dot(g,g)*210.)*step(.9,dot(ray,gal));
 color+=vec3(.38,.43,.58)*disk;
 return color;
}
// A finite, irregular volume preserves the old image's blue-grey clouds and
// pale gold filaments from every viewing direction. A perturbed shell density
// avoids drawing smooth nested ellipses. Its dimensions are a young-nebula model.
vec3 dyingStarGas(vec3 color,vec3 ray,float closest){
 vec3 axes=uShellAxes*mix(.12,1.,smoothstep(0.,1.,uEventProgress));
 vec3 origin=-uSun.xyz/axes,direction=ray/axes;
 float aa=dot(direction,direction),bb=dot(origin,direction);
 vec3 perpendicular=origin-direction*(bb/aa);float disc=1.44-dot(perpendicular,perpendicular);
 if(disc<0.)return color;
 float nearT=max(0.,-bb/aa-sqrt(disc/aa)),farT=min(closest,-bb/aa+sqrt(disc/aa));
 if(farT<=nearT)return color;
 float stepT=(farT-nearT)/16.,opticalStep=stepT*sqrt(aa);
 for(int sampleIndex=0;sampleIndex<16;sampleIndex++){
   float t=farT-(float(sampleIndex)+.5)*stepT;
   vec3 p=origin+direction*t;float radial=length(p);vec3 n=p/max(radial,.0001);
   float cloud=noise(n*5.+vec3(.3,uEventProgress*.35,0.));
   float shellRadius=.83+cloud*.26;
   float fine=noise(p*16.+vec3(cloud*3.));
   float density=exp(-pow((radial-shellRadius)/.095,2.))*(.18+.82*fine);
   float filament=exp(-pow((noise(p*37.+cloud*2.)-.5)/.032,2.));
   float alpha=1.-exp(-density*opticalStep*3.4);
   vec3 gas=mix(vec3(.25,.36,.51),vec3(.74,.64,.46),filament*.78);
   color=mix(color,gas,alpha)+vec3(.25,.20,.12)*filament*alpha*.25;
 }
 return color;
}
float eclipse(vec3 point,vec3 light,float lightDistance){float visible=1.;
 for(int j=0;j<${maxBodies};j++){vec3 offset=uBodies[j].xyz-point;float r=uBodies[j].w,along=dot(offset,light);vec3 off=offset-light*along;
 if(r>0.&&along>r*.02&&along<lightDistance-r&&dot(off,off)<r*r)visible=.07;}
 return visible;
}
void main(){
 vec3 ray=normalize(uForward+uRight*uv.x*(uResolution.x/uResolution.y)*.532+uUp*uv.y*.532);
 vec3 color=sky(ray);float closest=1.e8;vec3 norm=vec3(0.),center=vec3(0.);vec4 material=vec4(-1.);float radius=0.;
 for(int i=0;i<${maxBodies};i++){
   vec3 c=uBodies[i].xyz;float r=uBodies[i].w;if(r<=0.)continue;
   float broadRadius=r*(uMaterial[i].w>.5?1.8:1.);
   float along=dot(c,ray);vec3 off=c-ray*along;float h=broadRadius*broadRadius-dot(off,off);
   if(h>=0.&&along>0.){
     float t=along-sqrt(h);vec3 normal=normalize(ray*t-c);
     if(uMaterial[i].w>.5){
       vec3 axes=uMaterial[i].w>1.5?vec3(1.7,.62,.71):vec3(1.19,.84,.94);
       vec3 origin=localNormal(-c/r,uMaterial[i]),direction=localNormal(ray,uMaterial[i]);
       vec3 o=origin/axes,d=direction/axes;float a=dot(d,d),b=dot(o,d);
       // Closest-approach form avoids subtraction of two huge squared numbers
       // for tiny, distant asteroids in single-precision fragment arithmetic.
       vec3 perpendicular=o-d*(b/a);float disc=1.-dot(perpendicular,perpendicular);
       if(disc<0.)continue;t=(-b/a-sqrt(max(0.,disc)/a))*r;
       normal=normalize(worldNormal((origin+direction*t/r)/(axes*axes),uMaterial[i]));
     }
     if(t>0.&&t<closest){closest=t;norm=normal;center=c;radius=r;material=uMaterial[i];}
   }
 }
 if(material.x>=0.){
   vec3 local=localNormal(norm,material);vec3 albedo=surface(material.x,local);
   bool selfLit=material.x<.5||(material.x>12.5&&material.x<14.5);
   if(selfLit){float limb=.58+.42*pow(max(0.,dot(norm,-ray)),.4);
     if(uEra>1.5&&uEra<2.5&&material.x<.5){
       float knots=terrain(local*16.+vec3(uClock*.08));
       albedo=mix(vec3(.90,.19,.045),vec3(1.,.66,.25),knots);
     }
     color=albedo*limb;
   }
   else {
     vec3 light=normalize(uSun.xyz-center);float sunlight=max(0.,dot(norm,light));
     float visibility=eclipse(ray*closest+norm*radius*.002,light,length(uSun.xyz-center));
     vec3 lightColor=uEra>3.5&&uEra<4.5?vec3(.75,.83,1.):uEra>2.5&&uEra<3.5?vec3(1.,.69,.42):vec3(1.);
     color=albedo*(vec3(.026)+sunlight*visibility*1.03*lightColor);
     if(material.x>2.5&&material.x<3.5){
       float cloud=smoothstep(.12,.89,map(10.,local).r);
       color=mix(color,vec3(.95,.97,1.)*(.04+sunlight*visibility),cloud*.8);
       color+=map(11.,local)*(1.-smoothstep(-.08,.18,dot(norm,light)))*.5;
       float rim=pow(1.-max(0.,dot(norm,-ray)),3.5);color+=vec3(.025,.17,.42)*rim*(.1+sunlight*.7);
       float ocean=step(albedo.r*1.35,albedo.b)*step(albedo.g*.85,albedo.b);
       color+=vec3(.4,.48,.55)*pow(max(0.,dot(reflect(-light,norm),-ray)),60.)*ocean*(1.-cloud)*.4;
     }
     if(material.x>11.5&&material.x<12.5)color=max(color,albedo*.7);
     if(material.x>19.5&&material.x<22.5&&abs(material.x-21.)>.1){
       float fissure=(1.-smoothstep(.015,.055,abs(noise(local*31.)-.5)))*smoothstep(.63,.79,terrain(local*6.));
       color+=vec3(.52,.075,.003)*fissure*(material.x<20.5 ? .22 : .08);
     }
     if(abs(material.x-21.)<.1||(material.x>22.5&&material.x<26.5)||(material.x>30.5&&material.x<34.5)){
       float rim=pow(1.-max(0.,dot(norm,-ray)),4.);color+=albedo*rim*(.035+sunlight*.16);
     }
     if(material.x>5.5&&material.x<6.5){
       vec3 ringN=vec3(sin(uSaturnTilt),cos(uSaturnTilt),0.);float den=dot(light,ringN);
       if(abs(den)>.001){float t=-dot(norm*radius,ringN)/den;float rr=length(norm*radius+light*t)/radius;
       if(t>0.&&rr>1.25&&rr<2.35)color*=.27;}
     }
   }
 }
 // Distant unresolved bodies appear as light points. Their physical spheres
 // stay at the correct radii; this minimum point-spread is an observation aid.
 float pixelAngle=1.064/uResolution.y;
 for(int i=0;i<${maxBodies};i++){
   vec3 c=uBodies[i].xyz;float radius=uBodies[i].w,dist=length(c);
   if(radius<=0.||dist<=radius||dist>closest+radius)continue;
   vec3 direction=c/dist;float facing=dot(ray,direction),angularRadius=radius/dist;
   if(facing>0.&&angularRadius<pixelAngle*1.2){
     float pixels=length(cross(ray,direction))/pixelAngle;
     if(pixels<3.5){
       float luminous=step(uMaterial[i].x,.5)+step(12.5,uMaterial[i].x)*step(uMaterial[i].x,14.5);
       float phase=luminous>.5?1.:.25+.75*max(0.,dot(normalize(uSun.xyz-c),-direction));
       float strength=mix(.30,.95,clamp(angularRadius/pixelAngle,0.,1.))*mix(phase,1.,min(1.,luminous));
       vec3 tint=uMaterial[i].x>13.5&&uMaterial[i].x<14.5?vec3(.64,.81,1.):vec3(1.,.88,.72);
       if(uNatural>.5&&uEra<.5){if(uMaterial[i].x<.5)tint=vec3(1.,.98,.95);else if(abs(uMaterial[i].x-8.)<.1)tint=vec3(.58,.77,.79);}
       color+=tint*exp(-pixels*pixels*1.25)*strength*(luminous>.5?1.7:1.);
     }
   }
 }
 for(int i=0;i<${maxBodies};i++){
   if(uMaterial[i].x>2.5&&uMaterial[i].x<3.5&&uBodies[i].w>0.){
     vec3 c=uBodies[i].xyz;float along=dot(c,ray),r=uBodies[i].w;float off=length(c-ray*along)/r;
     if(along>0.&&along<closest&&off>1.&&off<1.045){float glow=pow(1.-(off-1.)/.045,2.);float lit=max(.05,dot(normalize(ray*along-c),normalize(uSun.xyz-c)));
     color+=vec3(.05,.26,.68)*glow*lit*.65;}
   }
 }
 // The tilted rings cast a shadow on Saturn and receive the planet's shadow.
 if(uSaturn.w>0.){
   vec3 ringN=vec3(sin(uSaturnTilt),cos(uSaturnTilt),0.);float den=dot(ray,ringN);
   if(abs(den)>.0001){float t=dot(uSaturn.xyz,ringN)/den;vec3 p=ray*t-uSaturn.xyz;float rr=length(p)/uSaturn.w;
     if(t>0.&&t<closest&&rr>1.25&&rr<2.35){float band=.54+.21*sin(rr*227.)+.15*sin(rr*541.);
       float gap=1.-smoothstep(.018,.035,abs(rr-1.93));vec3 rc=mix(vec3(.28,.24,.18),vec3(.85,.77,.59),band);
       vec3 light=normalize(uSun.xyz-uSaturn.xyz);float along=dot(-p,light);vec3 off=-p-light*along;
       if(along>0.&&length(off)<uSaturn.w)rc*=.14;
       color=mix(color,rc,.85*(1.-gap*.97));closest=t;
     }
   }
 }
 // The ion tail points away from the Sun even after the comet rounds perihelion.
 if(uComet.w>0.&&uCometActivity>0.){
   vec3 away=normalize(uComet.xyz-uSun.xyz),c=uComet.xyz;float sunDistance=length(c-uSun.xyz);
   float tailLength=min(.14,.16/max(.5,sunDistance*sunDistance));
   float k=dot(ray,away),den=max(.00001,1.-k*k);
   float t=(dot(c,ray)-k*dot(c,away))/den;float axis=dot(ray*t-c,away);
   float progress=clamp(axis/tailLength,0.,1.);float width=.000015+progress*.003;
   float distance=length(ray*t-c-away*axis);float tail=exp(-pow(distance/width,2.))*pow(1.-progress,1.6);
   if(t>0.&&t<closest&&axis>0.&&axis<tailLength)color+=vec3(.17,.44,.68)*tail*.65*uCometActivity;
   float h=dot(c,ray);float coma=length(c-ray*h)/max(uComet.w*18.,.000025);
   if(h>0.&&h<closest)color+=vec3(.18,.63,.57)*exp(-coma*coma)*.48*uCometActivity;
 }
 // A rotating accretion disk with an inner hot region and a diffuse outer disk.
 // The shapes and light exposure are illustrative; the star keeps its AU radius.
 if(uEra>1.5&&uEra<2.5&&abs(ray.y)>.00001){
   for(int j=0;j<3;j++){float plane=(float(j)-1.)*uSun.w*.3;float t=(plane-uCamera.y)/ray.y;
     if(t>0.&&t<closest){vec3 p=uCamera+ray*t;float radial=length(p.xz),angle=atan(p.z,p.x);
       float spin=uClock*.018+uEventProgress*2.;
       vec3 rotating=vec3(cos(angle-spin)*radial,p.y,sin(angle-spin)*radial);
       float grain=terrain(rotating*.8+vec3(0.,float(j)*3.,0.));
       float ribbons=.65+.35*sin(radial*3.3+angle*3.-spin*2.+grain*6.);
       float envelope=smoothstep(uSun.w*1.3,uSun.w*2.6,radial)*(1.-smoothstep(24.,40.,radial));
       float inner=exp(-radial/max(.3,uSun.w*20.));
       float alpha=envelope*grain*ribbons*mix(.50,.29,uEventProgress);
       vec3 dust=mix(vec3(.14,.10,.16),vec3(.82,.38,.13),1.-min(1.,radial/25.));
       dust+=vec3(.8,.37,.10)*inner;
       color=mix(color,dust,alpha);}
   }
   // Twin outflows are perpendicular to the disk, not an explosion in space.
   float k=ray.y,den=max(.000001,1.-k*k);
   float along=(dot(uSun.xyz,ray)-k*uSun.y)/den;
   vec3 p=ray*along-uSun.xyz;float height=abs(p.y),jetLength=.8;
   float width=uSun.w*(.8+height*1.3),distance=length(p.xz);
   if(along>0.&&along<closest&&height>uSun.w&&height<jetLength){
     float pulse=.65+.35*sin(height*45.-uClock*.4-uEventProgress*35.);
     color+=vec3(.32,.57,.78)*exp(-distance*distance/(width*width))*(1.-height/jetLength)*pulse*.35;
   }
 }
 // Giant-impact flash and an orbiting debris disk are centred on the Earth.
 // Later the disk fades as the model Moon forms in the physical body list.
 if(uEra>4.5&&uEra<5.5&&uEarth.w>0.){
   vec3 localCamera=-uEarth.xyz/uEarth.w;float den=ray.y;
   if(uDebris>0.&&abs(den)>.00001){
     float t=-localCamera.y/den;vec3 p=localCamera+ray*t;float radial=length(p.xz);
     if(t>0.&&t*uEarth.w<closest&&radial>1.35&&radial<5.8){
       float angle=atan(p.z,p.x),spin=uEventProgress*38.+uClock*.03;
       float clumps=terrain(vec3(cos(angle-spin)*radial,sin(angle-spin)*radial,radial*3.));
       float bands=.55+.45*sin(radial*21.+clumps*7.);
       float alpha=uDebris*(1.-smoothstep(4.,5.8,radial))*(.3+bands*.35)*clumps;
       color=mix(color,mix(vec3(.22,.09,.035),vec3(.95,.48,.15),clumps),alpha);
     }
   }
   if(uImpact>0.){
     float along=dot(uEarth.xyz,ray),offset=length(uEarth.xyz-ray*along)/uEarth.w;
     if(along>0.&&along<closest+uEarth.w*2.)color+=vec3(1.,.65,.2)*exp(-offset*offset*.23)*uImpact*.6;
   }
 }
 if(uEra>3.5&&uEra<4.5)color=dyingStarGas(color,ray,closest);
 if(uSun.w>0.){
   vec3 sun=normalize(uSun.xyz);float angle=length(cross(ray,sun));float angularRadius=uSun.w/max(length(uSun.xyz),uSun.w);
   if(dot(ray,sun)>0.&&material.x<0.){
     vec3 glow=uEra>3.5&&uEra<4.5?vec3(.48,.72,1.):uEra>2.5&&uEra<3.5?vec3(1.,.32,.08):vec3(1.,.70,.31);
     if(uNatural>.5&&uEra<.5)glow=vec3(1.,.98,.95);
     color+=glow*min(.75,pow(angularRadius/max(angle,.000001),2.)*.14);
     if(uEra>3.5&&uEra<4.5){float pixels=angle/pixelAngle;color+=glow*(exp(-pixels*pixels/70.)*.16+exp(-pixels*pixels/3.)*.5);}
   }
 }
 gl_FragColor=vec4(pow(max(color,vec3(0.)),vec3(.94)),1.);
}`;}

export function createSolarRenderer(canvas){
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true,powerPreference:'low-power'});
  if(!gl)throw new Error('この端末で3D表示を開始できませんでした。WebGLが使えるChromeで開いてください。');
  const capacity=Math.min(25,Math.max(4,Math.floor((gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)-26)/2)));
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const message=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error('3D描画の準備に失敗しました: '+message);}return s;}
  const vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragmentSource(capacity)),program=gl.createProgram();
  gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('3D描画を開始できませんでした。');
  gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const attr=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
  const names=['uResolution','uRight','uUp','uForward','uCamera','uBodies[0]','uMaterial[0]','uSun','uSaturn','uSaturnTilt','uComet','uCometActivity','uEarth','uShellAxes','uEventProgress','uClock','uImpact','uDebris','uEra','uLoaded','uAtlas','uSky','uNatural','uIllustratedSky','uSkySeed'];
  const uniforms=Object.fromEntries(names.map(n=>[n,gl.getUniformLocation(program,n)]));
  let lost=false,loaded=false,lastState=null;
  const textures=textureImages.map((_,i)=>{const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,t);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,1,1,0,gl.RGB,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0]));
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);return t;});
  function upload(){if(lost||loaded||textureImages.some(image=>!image?.complete||!image.naturalWidth))return;
    textureImages.forEach((image,i)=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,textures[i]);let source=image;
      const maximum=gl.getParameter(gl.MAX_TEXTURE_SIZE);if(image.width>maximum){source=document.createElement('canvas');source.width=maximum;source.height=Math.round(image.height*maximum/image.width);source.getContext('2d').drawImage(image,0,0,source.width,source.height);}
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,source);
      // The atlas has no gutters. Automatic mipmaps mix adjacent planets and
      // the unused black row, especially at the longitude's UV discontinuity.
      // Bilinear sampling avoids those dark seam ticks without resizing bodies.
      if(i===0)gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      else {gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);}
    });loaded=true;
  }
  function draw(state){
    if(lost||gl.isContextLost())throw new Error('3D表示が中断されました。ページを再読み込みしてください。');
    lastState=state;upload();const view=basis(state.orientation),actualBodies=getBodies(state),effects=eventVisuals(state,actualBodies),all=[...actualBodies,...effects.extraBodies];
    const bodies=all.length<=capacity?all:[...all].sort((a,b)=>a.id==='sun'?-1:b.id==='sun'?1:Math.hypot(...sub(a.position,state.position))/a.radius-Math.hypot(...sub(b.position,state.position))/b.radius).slice(0,capacity);
    const positions=new Float32Array(capacity*4),materials=new Float32Array(capacity*4);
    bodies.forEach((body,i)=>{positions.set([...sub(body.position,state.position),body.radius],i*4);materials.set([renderAppearance(body),body.rotation||0,body.axialTilt||0,body.irregular||0],i*4);});
    const asUniform=id=>{const body=all.find(b=>b.id===id);return body?[...sub(body.position,state.position),body.radius]:[0,0,0,0];};
    gl.viewport(0,0,canvas.width,canvas.height);gl.useProgram(program);
    gl.uniform2f(uniforms.uResolution,canvas.width,canvas.height);
    gl.uniform3fv(uniforms.uRight,view.right);gl.uniform3fv(uniforms.uUp,view.up);gl.uniform3fv(uniforms.uForward,view.forward);gl.uniform3fv(uniforms.uCamera,state.position);
    gl.uniform4fv(uniforms['uBodies[0]'],positions);gl.uniform4fv(uniforms['uMaterial[0]'],materials);
    gl.uniform4fv(uniforms.uSun,asUniform('sun'));gl.uniform4fv(uniforms.uSaturn,all.find(body=>body.id==='saturn')?.hasRings?asUniform('saturn'):[0,0,0,0]);gl.uniform4fv(uniforms.uComet,asUniform('halley'));
    gl.uniform4fv(uniforms.uEarth,asUniform('earth'));gl.uniform3fv(uniforms.uShellAxes,WHITE_DWARF_SHELL_AXES);
    gl.uniform1f(uniforms.uEventProgress,effects.progress);gl.uniform1f(uniforms.uImpact,effects.impact);gl.uniform1f(uniforms.uDebris,effects.debris);
    gl.uniform1f(uniforms.uClock,((state.rotationDaysElapsed??state.simulationDays) || 0)%10000);
    gl.uniform1f(uniforms.uSaturnTilt,all.find(b=>b.id==='saturn')?.axialTilt||.467);
    gl.uniform1f(uniforms.uCometActivity,all.find(b=>b.id==='halley')?.tailStrength||0);
    gl.uniform1f(uniforms.uEra,({'early-universe':1,'solar-nebula':2,'red-giant':3,'white-dwarf':4,'young-earth':5})[state.era]||0);
    const visual=visualProfile(state);
    gl.uniform1f(uniforms.uNatural,visual.natural?1:0);gl.uniform1f(uniforms.uIllustratedSky,visual.backgroundKind==='illustrated'?1:0);gl.uniform1f(uniforms.uSkySeed,visual.skySeed);
    gl.uniform1f(uniforms.uLoaded,loaded?1:0);gl.uniform1i(uniforms.uAtlas,0);gl.uniform1i(uniforms.uSky,1);
    textures.forEach((texture,i)=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,texture);});
    gl.drawArrays(gl.TRIANGLES,0,6);
  }
  rendererReady.then(()=>{if(!lost&&lastState)draw(lastState);}).catch(()=>{});
  return {draw,ready:rendererReady,dispose(){if(lost)return;lost=true;textures.forEach(t=>gl.deleteTexture(t));gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);gl.getExtension('WEBGL_lose_context')?.loseContext();}};
}
let photoRenderer,photoCanvas;
export function drawSolarPhoto(ctx,snapshot,x,y,width,height){
  if(!photoCanvas){photoCanvas=document.createElement('canvas');photoRenderer=createSolarRenderer(photoCanvas);}
  const aspect=snapshot.aspect||16/9;
  photoCanvas.width=Math.min(1280,Math.max(640,Math.round(width)));photoCanvas.height=Math.round(photoCanvas.width/aspect);
  photoRenderer.draw(snapshot);
  const w=Math.min(width,height*aspect),h=w/aspect;
  ctx.drawImage(photoCanvas,x+(width-w)/2,y+(height-h)/2,w,h);
}
