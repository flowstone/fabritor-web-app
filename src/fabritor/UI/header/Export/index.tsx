import { Dropdown, Button, message } from 'antd';
import { ExportOutlined, FileOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { base64ToBlob, uuid } from '@/utils';
import { useContext, useRef } from 'react';
import { GlobalStateContext } from '@/context';
import LocalFileSelector from '@/fabritor/components/LocalFileSelector';
import { CenterV } from '@/fabritor/components/Center';
import { SETTER_WIDTH } from '@/config';
import { Trans, translate, useTranslation } from '@/i18n/utils';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import { writeImage } from '@tauri-apps/plugin-clipboard-manager'; // 剪贴板操作

const i18nKeySuffix = 'header.export';

const items: MenuProps['items'] = ['jpg', 'png', 'svg', 'json', 'divider', 'clipboard'].map(
  item => (item === 'divider' ? ({ type: 'divider' }) : ({ key: item, label: <Trans i18nKey={`${i18nKeySuffix}.${item}`} /> })),
);

export const downloadFile = async (content: string, type: string, name: string) => {
  try {
    // 使用 Tauri 的 save 对话框让用户选择保存路径
    const result = await save({
      defaultPath: `${name || uuid()}.${type}`,
      filters: [{
        name: type.toUpperCase(),
        extensions: [type],
      }],
    });

    if (result) {
      // 将内容保存到用户选择的路径
      await writeTextFile(result, content, { baseDir: BaseDirectory.Desktop });
      message.success(translate(`${i18nKeySuffix}.save_success`));
    }
  } catch (error) {
    console.error(error);
    message.error(translate(`${i18nKeySuffix}.save_fail`));
  }
};
export default function Export() {
  const { editor, setReady, setActiveObject } = useContext(GlobalStateContext);
  const localFileSelectorRef = useRef<any>();
  const { t } = useTranslation();

  const selectJsonFile = () => {
    localFileSelectorRef.current?.start?.();
  };

  const handleFileChange = (file) => {
    setReady(false);
    const reader = new FileReader();
    reader.onload = (async (evt) => {
      const json = evt.target?.result as string;
      if (json) {
        await editor.loadFromJSON(json, true);
        editor.fhistory.reset();
        setReady(true);
        setActiveObject(null);
        editor.fireCustomModifiedEvent();
      }
    });
    reader.readAsText(file);
  };

  const copyImage = async () => {
    try {
      const png = editor.export2Img({ format: 'png' });
      // const blob = await base64ToBlob(png);
      // await navigator.clipboard.write([
      //   new ClipboardItem({
      //     'image/png': blob,
      //   }),
      // ]);
      await writeImage(png);
      message.success(translate(`${i18nKeySuffix}.copy_success`));
    } catch (e) {
      console.error(e);
      message.error(translate(`${i18nKeySuffix}.copy_fail`));
    }
  };

  const handleClick = ({ key }) => {
    const { sketch } = editor;
    // @ts-ignore
    const name = sketch.fabritor_desc;
    switch (key) {
      case 'png':
        const png = editor.export2Img({ format: 'png' });
        downloadFile(png, 'png', name);
        break;
      case 'jpg':
        const jpg = editor.export2Img({ format: 'jpeg' });
        downloadFile(jpg, 'jpg', name);
        break;
      case 'svg':
        const svg = editor.export2Svg();
        downloadFile(svg, 'svg', name);
        break;
      case 'json':
        const json = editor.canvas2Json();
        downloadFile(`data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(json, null, 2),
        )}`, 'json', name);
        break;
      case 'clipboard':
        copyImage();
        break;
      default:
        break;
    }
  };
  return (
    <CenterV
      justify="flex-end"
      gap={16}
      style={{
        width: SETTER_WIDTH,
        paddingRight: 16,
      }}
    >
      <Button onClick={selectJsonFile} icon={<FileOutlined />}>
        {t(`${i18nKeySuffix}.load`)}
      </Button>
      <Dropdown
        menu={{ items, onClick: handleClick }}
        arrow={{ pointAtCenter: true }}
        placement="bottom"
      >
        <Button type="primary" icon={<ExportOutlined />}>{t(`${i18nKeySuffix}.export`)}</Button>
      </Dropdown>
      <LocalFileSelector accept="application/json" ref={localFileSelectorRef} onChange={handleFileChange} />
    </CenterV>
  );
}