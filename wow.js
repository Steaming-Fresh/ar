import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';
import { GLTFLoader } from 'GLTFLoader';

// const loadGLB = (path) => {//加载glb模型，gltf也可以加载
//     return new Promise((resolve, reject) => {
//         const loader = new GLTFLoader();
//         loader.load(path,(glb)=>{
//             resolve(glb);
//         });
//     });
// }

const loadGLB = (path) => {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(path, (glb) => {
            glb.scene.traverse((child) => {
                if (child.isMesh) {
                    // 更改材质为MeshStandardMaterial
                    const newMaterial = new THREE.MeshStandardMaterial({
                        map: child.material.map, // 保留原有的贴图
                        metalness: 0.5, // 金属感，根据需要调整
                        roughness: 0.5, // 粗糙度，根据需要调整
                        side: THREE.DoubleSide // 如果有需要，确保材质从双面渲染
                    });
                    child.material = newMaterial;
                }
            });
            resolve(glb);
        });
    });
};


document.addEventListener('DOMContentLoaded', async function () {
    const start = async () => {
        // 初始化MindARThree，设置容器为body，并指定图像目标源文件
        const mindarThree = new MindARThree({
            container: document.body, // AR内容将在整个网页体内渲染，也可以在html写别的标签，然后改成那个标签
            imageTargetSrc: "a.mind", // 指定一个目标图像文件，包含了AR识别所需的图像数据
        });

        // 从mindarThree对象中解构出renderer（渲染器），scene（场景）和camera（相机）
        const { renderer, scene, camera } = mindarThree;

        const light = new THREE.DirectionalLight(0xffffff, 1); // 方向光强度调低
        light.position.set(0, 0, 1); // 光源位置
        scene.add(light);

        const anchor = mindarThree.addAnchor(0);//扫描到第一张图片
        const ganchor = mindarThree.addAnchor(1);
        //加载模型
        const glb = await loadGLB('dog.glb');
        glb.scene.scale.set(8, 8, 8);//尺寸设置。不同模型设置的可能不同，视频说凭感觉试
        glb.scene.position.set(0, -0.4, 0);//位置设置
        anchor.group.add(glb.scene);
        ganchor.group.add(glb.scene.clone());//克隆一个模型，放到第二张图片上
        
        //模型动画，如果模型有动画的话
        // const mixer=new THREE.AnimationMixer(glb.scene);
        // const action=mixer.clipAction(glb.animations[0]);
        // action.play();

        //时钟，如果有动画
        // const clock = new THREE.Clock();

        await mindarThree.start();//启动AR       

        // 设置渲染循环，不断渲染场景
        renderer.setAnimationLoop(() => {

            // const delta=clock.getDelta();
            // mixer.update(delta);//每隔delta时间更新一次动画

            glb.scene.rotation.y += 0.01;//模型旋转
            renderer.render(scene, camera); // 使用渲染器渲染场景和相机，生成最终图像
        });
    };

    start();
});


