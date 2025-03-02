import { Dropdown, Button, message } from 'antd';
import { ExportOutlined, FileOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { downloadFile, base64ToBlob } from '@/utils';
import { useContext, useRef } from 'react';
import { GlobalStateContext } from '@/context';
import LocalFileSelector from '@/fabritor/components/LocalFileSelector';
import { CenterV } from '@/fabritor/components/Center';
import { SETTER_WIDTH } from '@/config';
import { Trans, translate, useTranslation } from '@/i18n/utils';

const i18nKeySuffix = 'header.export';

const items: MenuProps['items'] = ['jpg', 'png', 'svg', 'json', 'divider', 'clipboard'].map(
  item => (item === 'divider' ? ({ type: 'divider' }) : ({ key: item, label: <Trans i18nKey={`${i18nKeySuffix}.${item}`} /> })),
);

export default function Export() {
  const { editor, setReady, setActiveObject } = useContext(GlobalStateContext);
  const localFileSelectorRef = useRef<any>();
  const { t } = useTranslation();

  const selectJsonFile = () => {
    localFileSelectorRef.current?.start?.();
  };

  const handleFileChange = async (file) => {
    setReady(false);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          await editor.loadFromJSON(jsonData, true);
          editor.fhistory.reset();
          setReady(true);
          setActiveObject(null);
          editor.fireCustomModifiedEvent();
        } catch (err) {
          console.error('Failed to parse JSON:', err);
          message.error(t(`${i18nKeySuffix}.import_fail`));
        }
      };
      reader.readAsText(file);
    } catch (e) {
      console.error('Failed to load file:', e);
      message.error(t(`${i18nKeySuffix}.import_fail`));
    }
  };

  const copyImage = async () => {
    try {
      const png = editor.export2Img({ format: 'png' });
      const blob = await base64ToBlob(png);
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      message.success(translate(`${i18nKeySuffix}.copy_success`));
    } catch (e) {
      message.error(translate(`${i18nKeySuffix}.copy_fail`));
    }
  };

  const handleClick = async ({ key }) => {
    const { sketch } = editor;
    // @ts-ignore
    const name = sketch.fabritor_desc;
    try {
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
          await copyImage();
          break;
        default:
          break;
      }
    } catch (e) {
      message.error('Failed to save file');
      console.error('Export error:', e);
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